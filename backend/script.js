import { Client } from "@elastic/elasticsearch";

const esClient = new Client({ node: "http://3.90.171.235:9200" });

async function test() {
  const info = await esClient.info();
  console.log(info);
}

test();
