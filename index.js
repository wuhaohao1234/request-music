const requests = require("requests");
const fs = require("fs");

const getMusicType = () => {
  return new Promise((resolve, reject) => {
    requests("https://tonzhon.com/api/playlist_recommendations")
      .on("data", function (chunk) {
        resolve(JSON.parse(chunk).playlists);
      })
      .on("end", function (err) {
        reject(err);
      });
  });
};

const getMusicListById = (musciTypeId) => {
  return new Promise((resolve, reject) => {
    requests("https://tonzhon.com/api/playlists/" + musciTypeId)
      .on("data", function (chunk) {
        resolve(JSON.parse(chunk).playlist.songs);
      })
      .on("end", function (err) {
        reject(err);
      });
  });
};

const getMusicInfo = (originalId, platform) => {
  return new Promise((resolve, reject) => {
    requests(
      "https://tonzhon.com/secondhand_api/song_source/" +
        platform +
        "/" +
        originalId
    )
      .on("data", function (chunk) {
        resolve(JSON.parse(chunk));
      })
      .on("end", function (err) {
        reject(err);
      });
  });
};

const init = async () => {
  const arr = [];
  const musicType = await getMusicType();
  for (let i = 0; i < musicType.length; i++) {
    const musciTypeObj = {};
    const element = musicType[i];
    musciTypeObj.name = element.name;
    musciTypeObj.list = [];
    const musicList = await getMusicListById(element.id);
    for (let k = 0; k < musicList.length; k++) {
      const item = musicList[k];
      const musicInfo = await getMusicInfo(item.originalId, item.platform);
      if (musicInfo?.data) {
        item.dataSource = musicInfo?.data?.songSource;
      }
      const objItem = {
        name: item.name,
        platform: item.platform,
        album: item.album,
        dataSource: item.dataSource
      };

      musciTypeObj.list.push(objItem);
      console.log(musciTypeObj);
    }
    arr.push(musciTypeObj);
  }
  fs.writeFileSync("./a.json", JSON.stringify(arr));
};

init();
