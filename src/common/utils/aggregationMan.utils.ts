import { zipObject, forEach, map, flatten, isEmpty } from 'lodash'
const LANG = ["ar", "en"]

export const langPipeline = (langConfig) => {
    if (!langConfig || (langConfig && langConfig.lang === "multiLang")) return [];
    const langField = zipObject([langConfig.langField], [`$${langConfig.langField}_${langConfig.lang}`])
    const langsToRemove = map(LANG, (lang) => langConfig.langField + '_' + lang)
    const unwantedFields = zipObject(langsToRemove, new Array(langsToRemove.length).fill(0))
    return [
        {
            $addFields: {
                ...langField
            },
        },
        {
            $project: {
                ...unwantedFields
            },
        }
    ]
};

export const aggregationMan = (aggregation, query, options={}) => {
    if (aggregation.length <= 0) return []
    let opt = []
    if(!isEmpty(options)){
        opt = map(options,(value,key)=>{
            const temp = {}
            temp[key] = value
            return temp
        })
    }
    let fullPipeline: any = [
        {
            $match: query,
        }
    ]
    forEach(aggregation, (lookupConfig) => {
        fullPipeline = [...fullPipeline, ...lookupBuilder(lookupConfig)]
    })
    return [...fullPipeline,...opt];
}

export const buildProjection = (lookupConfig) => {
    if (!lookupConfig.exclude) return []
    let projection = {}
    forEach(lookupConfig.exclude, (field) => {
        projection = { ...projection, ...zipObject([field], [0]) }
    })
    return [
        {
            "$project": projection
        }
    ]
}

export const addRemainingTimeField = (lookupConfig) => {
    if(!lookupConfig.computedDateField) return []
    const remaining_time_value = {
        $dateDiff: {
            startDate: new Date(),
            endDate: {
                $dateAdd:{
                    startDate: `$${lookupConfig.computedDateField.relatedField}`,
                    unit: "hour",
                    amount: lookupConfig.computedDateField.maxDuration
                }
            },
            unit: "millisecond"
        }
    }
    const remaining_time = [{
        $addFields: {
            ...zipObject([lookupConfig.computedDateField.name], [remaining_time_value])
        }
    }]
    return remaining_time
}

export const lookupBuilder = (lookupConfig) => {
    const foriegnField = zipObject([lookupConfig.foriegnField], [`$${lookupConfig.foriegnField}`])
    let innerLookup = []
    let unwind = {}
    if (lookupConfig.innerLookup && lookupConfig.innerLookup.length > 0) {
        lookupConfig.innerLookup.forEach((lookup) => innerLookup.push(lookupBuilder(lookup)))
    }
    innerLookup = flatten(innerLookup);

    const project = buildProjection(lookupConfig)

    const remaining_time = addRemainingTimeField(lookupConfig)

    if (lookupConfig.langConfig && !lookupConfig.ref)
        return langPipeline(lookupConfig.langConfig)

    if(lookupConfig.unwind)
        unwind = {"$unwind":lookupConfig.unwind.field}

    const pipeline =  [
        {
            $lookup: {
                from: lookupConfig.ref,
                let: foriegnField,
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [`$${lookupConfig.lookupField}`, `$$${lookupConfig.foriegnField}`],
                                    },
                                ],
                            },
                        },
                    },
                    ...langPipeline(lookupConfig.langConfig),
                    ...innerLookup
                ],
                as: lookupConfig.foriegnField,
            },
        },
        {
            $unwind: {
                path: `$${lookupConfig.foriegnField}`,
                preserveNullAndEmptyArrays: true,
            },
        },
        ...project,
        ...remaining_time
    ]

    if(!isEmpty(unwind)){
        const groupedFields = {}
        forEach(lookupConfig.unwind.groupedFields,(gf)=> (groupedFields[gf]={'$first':`$${gf}`}))
        return [
            unwind,
            ...pipeline,
            {
                $group: {
                    _id: "$_id",
                    [lookupConfig.unwind.field.replace("$",'')]: { $push: lookupConfig.unwind.field },
                    ...groupedFields
                }
            }
        ]
    }
        
    return pipeline
}


