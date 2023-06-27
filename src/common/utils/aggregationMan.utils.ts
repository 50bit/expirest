import { zipObject, forEach, map } from 'lodash'
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

export const aggregationMan = (aggregation, query) => {
    if(aggregation.length <= 0 ) return []
    let fullPipeline:any = [
        {
            $match: query,
        }
    ]
    forEach(aggregation,(lookupConfig)=>{
        fullPipeline = [...fullPipeline , ...lookupBuilder(lookupConfig)]
    })
    return fullPipeline;
}

export const lookupBuilder = (lookupConfig) => {
    const foriegnField = zipObject([lookupConfig.foriegnField], [`$${lookupConfig.foriegnField}`])
    const innerLookup = lookupConfig.innerLookup ? lookupBuilder(lookupConfig.innerLookup) : [];

    if(lookupConfig.langConfig && !lookupConfig.ref)
        return langPipeline(lookupConfig.langConfig)

    return [
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
    ]
}


