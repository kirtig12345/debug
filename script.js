

```javascript
function initStorage(){

if(!localStorage.getItem('collections')){
localStorage.setItem('collections',JSON.stringify([]));
}

if(!localStorage.getItem('scores')){
localStorage.setItem('scores',JSON.stringify({}));
}

if(!localStorage.getItem('reports')){
localStorage.setItem('reports',JSON.stringify([]));
}
}

initStorage();

const houseDatabase={

H001:{area:'Hill Area',lat:12.971601,lng:77.594601},
H002:{area:'Hill Area',lat:12.971620,lng:77.594620},
H003:{area:'Hill Area',lat:12.971640,lng:77.594640},
H004:{area:'Hill Area',lat:12.971660,lng:77.594660},
H005:{area:'Hill Area',lat:12.971680,lng:77.594680},
H006:{area:'Hill Area',lat:12.971700,lng:77.594700},
H007:{area:'Hill Area',lat:12.971720,lng:77.594720},
H008:{area:'Hill Area',lat:12.971740,lng:77.594740},
H009:{area:'Hill Area',lat:12.971760,lng:77.594760},
H010:{area:'Hill Area',lat:12.971780,lng:77.594780}

};

function captureGPS(){

const btn=document.getElementById('captureGps');

navigator.geolocation.getCurrentPosition(

function(position){

const lat=position.coords.latitude;
const lng=position.coords.longitude;
const accuracy=position.coords.accuracy;

document.getElementById('latitude').innerText=lat.toFixed(6);
document.getElementById('longitude').innerText=lng.toFixed(6);
document.getElementById('accuracy').innerText=accuracy.toFixed(1)+'m';

document.getElementById('gpsLat').value=lat;
document.getElementById('gpsLng').value=lng;

document.getElementById('gpsDisplay').classList.remove('hidden');

btn.innerText='✅ GPS Captured';

},

function(){
alert('Unable to capture GPS');
},

{
enableHighAccuracy:true
}
);
}

function handlePhotoUpload(event){

const file=event.target.files[0];

if(!file)return;

const reader=new FileReader();

reader.onload=function(e){

document.getElementById('previewImg').src=e.target.result;
document.getElementById('photoPreview').classList.remove('hidden');
};

reader.readAsDataURL(file);
}

function updateScore(houseId,wasteType){

const scores=JSON.parse(localStorage.getItem('scores'));

if(!scores[houseId]){
scores[houseId]=100;
}

if(wasteType==='segregated'){
scores[houseId]+=5;
}

else if(wasteType==='wet'||wasteType==='dry'){
scores[houseId]+=2;
}

else if(wasteType==='mixed'){
scores[houseId]-=5;
}

else if(wasteType==='missed'){
scores[houseId]-=10;
}

if(scores[houseId]>100){
scores[houseId]=100;
}

if(scores[houseId]<0){
scores[houseId]=0;
}

localStorage.setItem('scores',JSON.stringify(scores));
}

function calculateDistance(lat1,lon1,lat2,lon2){

const R=6371000;

const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;

const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*Math.sin(dLon/2);

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;
}

function handleCollectionSubmit(event){

event.preventDefault();

const collectorId=document.getElementById('collectorId').value;
const houseId=document.getElementById('houseId').value.toUpperCase();
const wasteType=document.getElementById('wasteType').value;

const lat=parseFloat(document.getElementById('gpsLat').value);
const lng=parseFloat(document.getElementById('gpsLng').value);

if(!houseDatabase[houseId]){
alert('Invalid House ID');
return;
}

const house=houseDatabase[houseId];

const distance=calculateDistance(lat,lng,house.lat,house.lng);

if(distance>15){
alert('Collector not within 15 meters');
return;
}

const collections=JSON.parse(localStorage.getItem('collections'));

collections.push({
collectorId,
houseId,
area:house.area,
wasteType,
latitude:lat,
longitude:lng,
timestamp:new Date().toISOString()
});

localStorage.setItem('collections',JSON.stringify(collections));

updateScore(houseId,wasteType);

alert('Collection Submitted Successfully');

document.getElementById('collectionForm').reset();
document.getElementById('gpsDisplay').classList.add('hidden');
document.getElementById('photoPreview').classList.add('hidden');

document.getElementById('captureGps').innerText='Capture GPS';
}

function searchHouse(){

const houseId=document.getElementById('searchHouseId').value.toUpperCase();

const collections=JSON.parse(localStorage.getItem('collections'));
const scores=JSON.parse(localStorage.getItem('scores'));

const filtered=collections.filter(c=>c.houseId===houseId);

document.getElementById('residentData').classList.remove('hidden');

document.getElementById('cleanlinessScore').innerText=scores[houseId]||100;

document.getElementById('scoreProgress').style.width=(scores[houseId]||100)+'%';

document.getElementById('wetCount').innerText=filtered.filter(c=>c.wasteType==='wet').length;

document.getElementById('dryCount').innerText=filtered.filter(c=>c.wasteType==='dry').length;

document.getElementById('segregatedCount').innerText=filtered.filter(c=>c.wasteType==='segregated').length;

document.getElementById('mixedCount').innerText=filtered.filter(c=>c.wasteType==='mixed').length;

const tbody=document.getElementById('historyBody');

tbody.innerHTML='';

filtered.reverse().forEach(record=>{

tbody.innerHTML+=`
<tr>
<td>${new Date(record.timestamp).toLocaleString()}</td>
<td>${record.wasteType}</td>
<td>${record.collectorId}</td>
</tr>
`;
});

document.getElementById('residentData').dataset.houseId=houseId;
}

function reportMissed(){

const houseId=document.getElementById('residentData').dataset.houseId;

const reports=JSON.parse(localStorage.getItem('reports'));

reports.push({
houseId,
area:houseDatabase[houseId].area,
timestamp:new Date().toISOString()
});

localStorage.setItem('reports',JSON.stringify(reports));

updateScore(houseId,'missed');

alert('Missed collection reported');
}

function loadAdmin(){

if(!document.getElementById('reportsTableBody'))return;

const reports=JSON.parse(localStorage.getItem('reports'));

document.getElementById('missedReports').innerText=reports.length;

const reportBody=document.getElementById('reportsTableBody');

reportBody.innerHTML='';

reports.reverse().forEach(report=>{

reportBody.innerHTML+=`
<tr>
<td>${report.houseId}</td>
<td>${report.area}</td>
<td>${new Date(report.timestamp).toLocaleString()}</td>
</tr>
`;
});
}

document.addEventListener('DOMContentLoaded',()=>{

const gpsBtn=document.getElementById('captureGps');

if(gpsBtn){
gpsBtn.addEventListener('click',captureGPS);
}

const upload=document.getElementById('photoUpload');

if(upload){
upload.addEventListener('change',handlePhotoUpload);
}

const form=document.getElementById('collectionForm');

if(form){
form.addEventListener('submit',handleCollectionSubmit);
}

loadAdmin();
});
```