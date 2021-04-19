const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const fs = require("fs");
const argv = require('minimist')(process.argv.slice(2));
const asciichart = require ('asciichart');
const Table = require('cli-table');


const quality = argv.quality || 75;

const convertToMozJpeg = () => {
  return imagemin(['images/*'], {
    destination: 'build/images',
    plugins: [
        imageminMozjpeg({quality: quality})
    ]
  });
}

const convertToWebP = () => {
  return imagemin(['images/*'], {
    destination: 'build/images',
    plugins: [

        imageminWebp({quality: quality})
    ]
  });
}

const outputComparisons = (setA, setB) => {
  
  let comparison = [];
  setA.forEach((image, index) => {

    const sizeA = getFileSizeInBytes(image.destinationPath);
    const sizeB = getFileSizeInBytes(setB[index].destinationPath);
    const percentageDifference = sizeB/sizeA;
    const symbol = sizeB < sizeA ? -1 : 1;
    const difference = Math.abs((1 - (percentageDifference))) * 100; 

    comparison.push({
      image1: { file: image.destinationPath, size: sizeA},
      image2: { file: setB[index].destinationPath, size: sizeB },
      difference: symbol * difference.toFixed(2)
    })
  });

  return comparison;

}

const getFileSizeInBytes = (file) => {
  const stats = fs.statSync(file)
  return stats.size;
}

let imageset1, imageset2;
convertToMozJpeg()
.then((files) => {
  imageset1 = files;
  return convertToWebP()
}).then((files) => {
  imageset2 = files;
  let compareData = outputComparisons(imageset1, imageset2);
  let chart = [];
  let mean = 0;
  for (var i = 0; i < compareData.length; i++) {
    mean += compareData[i].difference;
    chart.push(compareData[i].difference)
  }
    
    console.log (asciichart.plot (chart, { height: 50 }))

  var table = new Table({
      head: ['Stat', 'Value'],
  });
  
  // table is an Array, so you can `push`, `unshift`, `splice` and friends
  table.push(['Images Tested', compareData.length]);
  table.push(['Mean', mean / compareData.length + '%']);

  console.log(table.toString());
})