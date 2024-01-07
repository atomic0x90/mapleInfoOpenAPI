const fetch = require('node-fetch-commonjs');
const path = require('path');
const fs = require('fs').promises; //file system

const saveLinkSkillToFile = require('./SaveLinkSkillToFile.js');
const readOCIDInFile = require('./ReadOCIDInFile.js');

async function linkSkill(world_type = 0, characterClass = ""){
	try {
		// 파일 읽기
		const characterOCIDDataArray = await readOCIDInFile(world_type,characterClass);

		console.log("characterOCIDDataArray:", characterOCIDDataArray);

		var saveResponseData;

		for(var i = 0;i < characterOCIDDataArray.length;i++){
			const data = await responseData(characterOCIDDataArray[i]);

			console.log(data);

			saveResponseData = processData(saveResponseData, data);
		}
	
		console.log("saveResponseData:"+saveResponseData);

	}catch(error){
		console.error(error);
	}
}

async function responseData(characterOCID){
	try{
		const linkSkillUrlString = "https://open.api.nexon.com/maplestory/v1/character/link-skill";
		// 현재 날짜를 얻어옴
		var currentDate = new Date();
		// API 업데이트 고려해서 2일 전 날짜로 설정
		currentDate.setDate(currentDate.getDate() - 2);

		var date = currentDate.toISOString().split('T')[0];

		const headers = { "x-nxopen-api-key": process.env.API_KEY };

		const queryParams = new URLSearchParams({
			ocid: characterOCID,
			date: date
		});

		const requestUrl = `${linkSkillUrlString}?${queryParams}`;

		var answer = await fetch(requestUrl, {
			method: 'GET',
			headers: headers
		});
		
		return await answer.json();
	}catch(error){
		console.error(error);
	}
}

async function processData(saveResponseData, data){
	try{
		if(saveResponseData){
			for(var i = 0;i < data.character_link_skill.length;i++){
				const existingSkill = saveResponseData.find(skill => skill.skill_name === data.character_link_skill[i].skill_name);

				if(existingSkill){
					existingSkill.skill_level += 1;
				}
				else{
					saveResponseData.push({
						skill_name: data.character_link_skill[i].skill_name,
						skill_description: data.character_link_skill[i].skill_description,
						skill_level: 1,
						skill_effect: data.character_link_skill[i].skill_effect,
						skill_icon: data.character_link_skill[i].skill_icon
					});
				}
			}
		}
		else{
			saveResponseData = data.character_link_skill.map(skill => ({
				skill_name: skill.skill_name,
				skill_description: skill.skill_description,
				skill_level: 1,
				skill_effect: skill.skill_effect,
				skill_icon: skill.skill_icon
			}));
		}

		return saveResponseData;
	}catch(error){
		console.error(error);
	}
}

linkSkill(0,"해적-캡틴");
