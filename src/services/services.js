import axios from "axios";

function request(params) {
  console.log("request111", params);
  return axios.get("https://restapi.amap.com/v5/place/text?parameters", {
    params: {
      ...params,
    },
  });
}
export { request };
