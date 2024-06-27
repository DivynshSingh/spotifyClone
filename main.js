console.log('scrpt starts');

var playin=false;
var aud;
var songs=[];
var ppSvg;

function toggle(){
    if(!playin){
    ppSvg.children[0].style.display='none';
    ppSvg.children[1].style.display='block';
    }else{
    ppSvg.children[0].style.display='block';
    ppSvg.children[1].style.display='none';
}}
async function getSongs(){
    let a = await fetch('http://127.0.0.1:5500/songs/');
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let links = div.getElementsByTagName('a');
    let songs=[];
    for(let i=1; i<links.length; i++){
        if(links[i].href.endsWith(".mp3"))songs.push(links[i]);
    }
    return songs;
}

async function getDuration(src){
    return new Promise((res,rej)=>{
        let a = new Audio(src);
        a.addEventListener('loadedmetadata', ()=>{
            res(a.duration);
        });
        a.addEventListener('error', (e)=>{
            rej(e);
        })
    });
}
async function playSong(songSrc){
 await playMini();
 if(!playin){
 aud = new Audio(songSrc);
 playin=true;
 aud.play();
}
else{
 if(songSrc!=aud.src){
    aud.src = songSrc;
    aud.play();
 }else{
    aud.pause();
    playin=false;
 }
}
toggle();
} 
async function main(){
    songs=await getSongs();

    for(let i=0; i<songs.length; i++){
        let htmlOfMsc=`<div class="msc flex items-center">
        <img src="song1.jpeg" alt="">
        <span>${(songs[i].title).slice(0, -4)}<div>${songs[i].title.slice(0, -4)}</div></span>
        <div class="dur">dur</div>
        <a href='${songs[i].href}' style="display:none">${songs[i].href}</a>
        </div>`;

        let div=document.createRange();
        div=div.createContextualFragment(htmlOfMsc);
        div=div.querySelector('.msc');
        
        div.querySelector('img').src='https://img.favpng.com/15/2/13/goofy-mickey-mouse-donald-duck-the-walt-disney-company-character-png-favpng-Xm04y6aaN019yXCyEUpcQYRqp.jpg';
        // div.querySelector('span').innerText=(songs[i].title).slice(0, -4);
        try{
            let dur=await getDuration(songs[i].href);
            div.children[2].innerText=`${parseInt(dur/60)} : ${parseInt(dur%60)}`;
        }catch{
            console.log('could not get aud metaData');
        }   
        div.addEventListener('click', (e)=>{
            playSong(e.target.closest('.msc').querySelector('a').getAttribute('href'));
        })
        document.getElementsByClassName('lib-msc')[0].appendChild(div);
    }
}

main();
main();
let playMini=async()=>{
    return new Promise((res,rej)=>{let playBar=document.createElement('div');
    if(document.querySelector('.player-par').children[0]){return res();}
    // playBar.setAttribute('class', 'player flex items-center');
    playBar.classList.add('player', 'flex', 'items-center');
    let html=`<div id="pause-play"><svg style="display: none;" width="40px" height="40px" viewBox="0.5 0 36 36"><path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg><svg style="display:block;" width="40px" height="40px" viewBox="-8 -8 40 40"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg></div><img class="playin-img flex justify-center" src="song1.jpeg" alt="">
        <div class="playin-info"><h4>Burn it down</h4><p>Linkin-park</p></div><div class="msc-pre-nxt flex justify-center"><div><svg width="30px" height="30px" viewBox="0 -2 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>previous [#999]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-104.000000, -3805.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M59.9990013,3645.86816 L59.9990013,3652.13116 C59.9990013,3652.84516 58.8540013,3653.25316 58.2180013,3652.82516 L53.9990013,3650.14016 L53.9990013,3652.13116 C53.9990013,3652.84516 53.4260013,3653.25316 52.7900013,3652.82516 L48.4790013,3649.69316 C47.9650013,3649.34616 47.7980013,3648.65316 48.3120013,3648.30616 L52.7900013,3645.17516 C53.4260013,3644.74616 53.9990013,3645.15416 53.9990013,3645.86816 L53.9990013,3647.85916 L58.2180013,3645.17516 C58.8540013,3644.74616 59.9990013,3645.15416 59.9990013,3645.86816" id="previous-[#999]"> </path> </g> </g> </g> </g></svg></div><div><svg width="30px" height="30px" viewBox="0 -2 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>next [#998]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-144.000000, -3805.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M99.684,3649.69353 L95.207,3652.82453 C94.571,3653.25353 94,3652.84553 94,3652.13153 L94,3650.14053 L89.78,3652.82453 C89.145,3653.25353 88,3652.84553 88,3652.13153 L88,3645.86853 C88,3645.15453 89.145,3644.74653 89.78,3645.17453 L94,3647.85953 L94,3645.86853 C94,3645.15453 94.571,3644.74653 95.207,3645.17453 L99.516,3648.30653 C100.03,3648.65353 100.198,3649.34653 99.684,3649.69353" id="next-[#998]"> </path> </g> </g> </g> </g></svg></div></div>`;
    playBar.innerHTML=html;
    document.querySelector('.player-par').appendChild(playBar);
    ppSvg=document.getElementById('pause-play');
    ppSvg.addEventListener('click', function(){
        if(playin){
            aud.pause();
            playin=false;
            toggle();
        }else{
            try{aud.play();
            playin=true;
            toggle();
        }catch(e){
                console.log(e);
            }
        }
    });
    res('done');})
}