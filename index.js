var kotoli = {
    kotoli: []
};

var displayMode = undefined;
var currentTheme = undefined;

function levenshteinDistance(a, b){
    let aLen = a.length+1, bLen = b.length+1;
    let board = [];
    for(let i=0;i<aLen*bLen;i++)board.push(0);

    for(let i=1;i<aLen;i++) board[i] = i;
    for(let j=1;j<bLen;j++) board[j*aLen] = j;
  
    for(let i=1;i<aLen;i++) for(let j=1;j<bLen;j++){
        board[i + j*aLen] = Math.min(Math.min(board[i-1 + j*aLen]     + 1,
                                              board[i   + (j-1)*aLen] + 1),
                                              board[i-1 + (j-1)*aLen] + (a[i-1] != b[j-1]));
    }

    return board[aLen-1 + (bLen-1)*aLen];
}

function spawnElements(){
    if ('serviceWorker' in navigator){
        navigator.serviceWorker.register('serviceWorker.js');
    }

    let topBar = document.createElement('div');
    topBar.classList.add("topBar");
    let searchBar = document.createElement('input');
    searchBar.classList.add("searchBar");
    searchBar.placeholder = "Da sukha...";
    searchBar.oninput = updateSearch;
    topBar.appendChild(searchBar);

    document.body.querySelector('#mainContent').appendChild(topBar);

    let noCodeAlert = document.createElement('p');
    noCodeAlert.appendChild(document.createElement('center'));
    noCodeAlert.querySelector('center').innerText = 'The page works, but the dictionary is not coded yet...';
    noCodeAlert.querySelector('center').innerHTML += '<br><a href="https://github.com/Ric3cir121/RicVikoli">Ric3cir121/RicVikoli</a> on Github, <a href="kotoli.json">kotoli.json</a>';
    noCodeAlert.querySelector('center').lang = "en";
    document.body.querySelector('#mainContent').appendChild(noCodeAlert);

    let searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'searchResultsContainer';
    document.getElementById('mainContent').appendChild(searchResultsContainer);
}
function openKotoba(kotobaId){
    let result = document.getElementById('result');
    if(result){
        result.remove();
    }

    let kotoba = kotoli.kotoli[kotobaId];

    result = document.createElement('div');
    result.id = 'result';

    let alRisonen = '';
    for(let risonen of kotoba.risonen) alRisonen += risonen;
    let alKotobara = '';
    for(let kotobara of kotoba.kotobara.slice(1)) alKotobara += kotobara + ', ';
    if(alKotobara.length >= 2)alKotobara = alKotobara.slice(0,-2);

    result.innerHTML = '<div class="resultTop"> <div class="resultTitle">' + kotoba.kotobara[0] + '</div> <div class="resultRisonen">' + alRisonen + '</div> </div>';
    result.innerHTML += '<div class="resultKotobara">' + alKotobara + '</div>';
    if(displayMode == 'desktop'){
        document.querySelector('.topBar').appendChild(result);
    }else{
        document.getElementById('mainContent').prepend(result);
    }
}
function sanitize(text){
    return text.replace('<', '&lt').replace('>', '&gt').replace('&', '&amp')
}
function updateSearch(){
    let input = document.querySelector('.searchBar').value ?? "";
    kotobaraLibre = kotoli.kotoli.slice()
    if(input){
        let kotobaScore = {}
        for(let result of kotobaraLibre){
            score = Infinity;
            for(let kotoba of result.kotobara)
                score = Math.min(score, levenshteinDistance(input.toLowerCase(), kotoba.toLowerCase()) - (kotoba.length - input.length) * .6);
            kotobaScore[result.kotobara[0]] = score;
        }
        kotobaraLibre.sort((a,b) => (kotobaScore[a.kotobara[0]] > kotobaScore[b.kotobara[0]]) -.5);
        let badScore = 0;
        for(badScore=0; badScore<kotobaraLibre.length; badScore++)
            if(kotobaScore[kotobaraLibre[badScore].kotobara[0]] > 3)break;
        kotobaraLibre = kotobaraLibre.slice(0,badScore);
    } else {
        kotobaraLibre.sort((a,b) => (a.kotobara[0].toLowerCase() > b.kotobara[0].toLowerCase()) -.5);
    }
    let searchResultsContainer = document.querySelector('#searchResultsContainer');
    searchResultsContainer.innerHTML = '';
    for(let i=0; i<kotobaraLibre.length; i++){
        let searchResult = document.createElement('div');
        searchResult.classList.add("searchResult");
        searchResult.onclick = ()=>{openKotoba(kotobaraLibre[i].id);};
        let kotoba = '<div class="kotoba">' + sanitize(kotobaraLibre[i].kotobara[0]) + '</div>';

        let alRisonen = '';
        for(let risonen of kotobaraLibre[i].risonen) alRisonen += sanitize(risonen);
        alRisonen = '<div class="risonen">' + alRisonen + '</div>';

        searchResult.innerHTML += '<div class="kotobaTop">' + kotoba + alRisonen + '</div>';

        let alKotobara = '';
        for(let kotobara of kotobaraLibre[i].kotobara.slice(1)) alKotobara += sanitize(kotobara) + ", ";
        if(alKotobara.length >= 2)alKotobara = alKotobara.slice(0,-2);
        searchResult.innerHTML += '<div class="kotobara">' + alKotobara + '</div>';

        searchResultsContainer.appendChild(searchResult);
    }
}
function setViewMode(mode){
    displayMode = mode;
    if(mode == 'desktop'){
        let topBar = document.body.querySelector('.topBar');
        let mainContent = document.getElementById('mainContent');
        topBar.style.width = '4in';
        topBar.style.bottom = '0%';
        document.body.style['margin-left'] = '4in';
        document.body.style.removeProperty('margin-top');
        document.body.height = '100%';
        mainContent.style.width = 'calc(100% - 4in)';
        mainContent.style.height = '100%';
        let result = document.getElementById('result');
        if(result){
            document.querySelector('.topBar').appendChild(result);
        }
    }else if(mode == 'mobile'){
        let topBar = document.querySelector('.topBar');
        let mainContent = document.getElementById('mainContent');
        topBar.style.width = '100%';
        topBar.style.removeProperty('bottom');
        document.body.style.removeProperty('margin-left');
        document.body.style['margin-top'] = '.68in';
        document.body.height = 'calc(100% - .68in)';
        mainContent.style.width = '100%';
        mainContent.style.height = 'calc(100% - .68in)';
        let result = document.getElementById('result');
        if(result){
            document.getElementById('mainContent').prepend(result);
        }
    }
}
function setTheme(theme){
    if(theme == currentTheme)return;
    if(theme == 'dark'){
        let stylesheet = document.getElementById('themedStyle');
        if(stylesheet){
            stylesheet.remove();
        }
        stylesheet = document.createElement('style');

        stylesheet.innerHTML = `
        body {
            background-color: #101010;
            color: #ffffff;
        }
        .topBar {
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }
        #result {
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }
        
        .searchBar {
            background-color: #303030;
            color: #ffffff;
            box-shadow: 0in .01in .1in #00000040;
        }

        .searchBar:focus {
            outline-color: #0080ff;
        }

        .searchBar:placeholder {
            color: #ffffff;
        }

        .searchResult{
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }`;

        document.head.append(stylesheet);
    }else if(theme == 'light'){
        let stylesheet = document.getElementById('themedStyle');
        if(stylesheet){
            stylesheet.remove();
        }
        stylesheet = document.createElement('style');

        stylesheet.innerHTML = `
        body {
            background-color: #ffffff;
            color: #101010;
        }
        .topBar {
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }
        #result {
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }
        
        .searchBar {
            background-color: #e0e0e0;
            color: #101010;
            box-shadow: 0in .01in .1in #00000020;
        }

        .searchBar:focus {
            outline-color: #0080ff;
        }

        .searchBar:placeholder {
            color: #101010;
        }

        .searchResult{
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }`;

        document.head.append(stylesheet);
    }
}
function addSmoothTheme(){
    let smoothTheme = document.createElement('style');
    smoothTheme.innerHTML = '* {transition: color .4s ease-in-out; transition: background-color .4s ease-in-out;}';
    document.head.appendChild(smoothTheme);
}
function autoSetView(){
    let inchWidth = window.innerWidth / document.querySelector('#inchMeter').offsetWidth;
    if (inchWidth < 11.15){
        setViewMode('mobile');
    } else {
        setViewMode('desktop');
    }
}
function autoSetTheme(){
    if (window.matchMedia("(prefers-color-scheme: dark)").matches){
        setTheme('dark');
    }else{
        setTheme('light');
    }
}
async function updateKotoli(){
    kotoli = await (await fetch('kotoli.json')).json();
    for(let i=0; i<kotoli.kotoli.length; i++){
        kotoli.kotoli[i].id = i;
    }
    updateSearch();
}

addEventListener("load", (event) => {
    spawnElements();
    autoSetView();
    autoSetTheme();
    updateKotoli();

    let interval = 0;
    setInterval(()=>{
        autoSetTheme();
        if(interval == 1){
            addSmoothTheme();
        }
        interval++;
    },100);
});

addEventListener("resize", (event) => {
    autoSetView();
});