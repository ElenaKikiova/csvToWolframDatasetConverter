const fs = require("fs");
const csv = require("csv-parser");
const inputFilePath = "./linux.csv";

let byWeek = {};
let weeksLimit = 80;
let currentWeekIndex = 1;
let faultsCount = 0;
let currentWeekEndDate;

let outputForWolfram = "";

function addWeek(date) {
	const newDate = new Date(date);
	newDate.setDate(date.getDate() + 7);
	return newDate;
}

fs.createReadStream(inputFilePath)
	.pipe(csv())
	.on("data", function (data) {
		try {
			let objectValues = Object.values(data);
			let valuesSplit = objectValues[0].split("\t");
			let createdAt = valuesSplit[0].split(" ")[0];
			let createdAtDate = new Date(createdAt);

			faultsCount++;

			if (currentWeekIndex > weeksLimit) return;
			if (currentWeekEndDate === undefined || currentWeekEndDate < createdAtDate) {
				currentWeekEndDate = addWeek(createdAtDate);
				byWeek[currentWeekIndex] = faultsCount;
				currentWeekIndex++;
			}
		} catch (err) {
			console.log("error reading csv", err);
		}
	})
	.on("end", function () {
		console.log("JSON object: ", byWeek);

		Object.entries(byWeek).forEach(([key, value]) => {
			outputForWolfram += `{${key}, ${value}},`;
		});

		outputForWolfram = `{${outputForWolfram.slice(0, -1)}}`;
		console.log("Output for Wolfram:", outputForWolfram);
	});
