/**
 * Creates index in ES.
*/
// const createIndex = async (client, indexName, shards = 3, replicas = 0) => {
//     try {
//         await client.indices.create({
//             index: indexName,
//             body: {
//                 settings: {
//                     number_of_shards: shards,
//                     number_of_replicas: replicas
//                 }
//             }
//         })
//     } catch (err) {
//         if (err?.meta?.body?.error?.root_cause[0]?.type?.includes('resource_already_exists_exception'))
//             console.log('Index already exists!')
//         else
//             throw err
//     }
// }

// module.exports = {
//     createIndex
// }