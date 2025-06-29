var playin = false;
var aud;
var ppSvg;
var songsCurr;
const jsmediatags = window.jsmediatags;

function toggle() {
    if (!playin) {
        ppSvg.children[0].style.display = 'none';
        ppSvg.children[1].style.display = 'block';
    } else {
        ppSvg.children[0].style.display = 'block';
        ppSvg.children[1].style.display = 'none';
    }
}
async function getSongs(folder) {
    let songs = [];
    let a = await fetch(`/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let links = div.getElementsByTagName('a');
    for (let i = 1; i < links.length; i++) {
        if (links[i].href.endsWith(".mp3")) songs.push(links[i]);
    }
    return songs;
}

async function getDuration(src) {
    return new Promise((res, rej) => {
        let a = new Audio(src);
        a.addEventListener('loadedmetadata', () => {
            res(a.duration);
        });
        a.addEventListener('error', (e) => {
            rej(e);
        })
    });
}
const handleVol = function (e) { aud.volume = (e.target.value) / 100; }
function start_seekbar(audio) {
    const seekbar = document.querySelector('#thumb_seek');
    const timer = document.getElementsByClassName('timer')[0];
    audio.addEventListener('loadedmetadata', function () {
        seekbar.setAttribute('max', audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
        if (audio.currentTime == audio.duration) {
            audio.currentTime = 0;
            document.getElementById('pause-play').click();
        }
        seekbar.value = audio.currentTime;
        let sec = parseInt(audio.currentTime % 60);
        sec = (sec < 10) ? `0${sec}` : `${sec}`;
        timer.innerText = `${parseInt(audio.currentTime / 60)}:${sec} / ${parseInt(audio.duration / 60)}:${parseInt(audio.duration % 60)}`;
    });
    seekbar.addEventListener('input', function () {
        audio.currentTime = seekbar.value;
    });
    seekbar.setAttribute('value', 0);
    document.querySelector('#volume-slider').addEventListener('input', handleVol)
}
async function playSong(address, link, lib_address) {
    let songSrc;
    if(address){
        songSrc = address.closest('.msc').querySelector('a').getAttribute('href');
        await playMini(address, null);
    }else{
        songSrc=link;
        await playMini(null, lib_address);
    }


    if (!playin) {
        if (!aud || aud.src != songSrc) {
            let vol = aud ? aud.volume : 0.5;
            aud = new Audio(songSrc);
            aud.volume = vol;
            start_seekbar(aud);
        }
        playin = true;
        aud.play();
    }
    else {
        if (songSrc != aud.src) {
            aud.src = songSrc;
            aud.play();
        } else {
            aud.pause();
            playin = false;
        }
    }
    toggle();
}
async function main(lib_name) {
    let songs = await getSongs(lib_name);
    songsCurr=songs;
    for (let i = 0; i < songs.length; i++) {
        let src = songs[i].href;
        let meta;
        await new Promise((res, rej) => {
            jsmediatags.read(src, {
                onSuccess: function (tag) {
                    meta = tag;
                    res();
                },
                onError: function (error) { console.log(error); rej(); }
            })
        });
        const data = meta.tags.picture.data;
        const format = meta.tags.picture.format;
        let base64String = "";
        for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
        }
        let imgLink = `data:${format}; base64, ${window.btoa(base64String)}`;

        let htmlOfMsc = `<div class="msc flex items-center">
        <img src="${imgLink}" alt="">
        <span><h4>${meta.tags.title}</h4><div>${meta.tags.artist}</div></span>
        <div class="dur">dur</div>
        <a href='${songs[i].href}'></a>
        </div>`;

        let div = document.createRange();
        div = div.createContextualFragment(htmlOfMsc);
        div = div.querySelector('.msc');

        // div.querySelector('img').src = imgLink;
        try {
            let dur = await getDuration(songs[i].href);
            div.children[2].innerText = `${parseInt(dur / 60)} : ${parseInt(dur % 60)}`;
        } catch {
            console.log('could not get aud metaData');
        }
        div.addEventListener('click', (e) => {
            playSong(e.target);
        })
        document.getElementsByClassName('lib-msc')[0].appendChild(div);
    }
}

let playMini = async (address, lib_address) => {
    await new Promise((res, rej) => {
        let src;
        let a;
        let heading;
        let imgPoster;
        let subHeading;
        if(address){
            a = address.closest('.msc');
            src = a.querySelector('a').getAttribute('href');
            imgPoster=a.querySelector('img').src;
            heading=a.children[1].children[0].innerText;
            subHeading=a.children[1].children[1].innerText;
        }else{
            imgPoster=lib_address.children[0].getAttribute('src');
            a=lib_address.children[1];
            heading=a.children[0].innerText;
            subHeading=a.children[1].innerText;
            src=a.children[2].getAttribute('href');
        }
        let currSong = new Audio(src);
        currSong.addEventListener('loadedmetadata', () => {
            if (document.querySelector('.player-par').children[0]) {
                if (aud.src == src) return res();
                let player = document.getElementsByClassName('player')[0];
                player.children[1].src = imgPoster;
                player.children[2].children[0].innerText = heading;
                player.children[2].children[1].innerText = subHeading;
                // start_seekbar(aud);
                return res();
            }
            // start_seekbar(aud);
            let playBar = document.createElement('div');
            
            playBar.classList.add('player', 'flex', 'items-center');
            let html = `<div id="pause-play"><svg style="display: none;" width="40px" height="40px" viewBox="0.5 0 36 36"><path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg><svg style="display:block;" width="40px" height="40px" viewBox="-8 -8 40 40"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg></div><img class="playin-img flex justify-center" src="${imgPoster}" alt="">
            <div class="playin-info"><h4>${heading}</h4>
            <p>${subHeading}</p></div>
            <div class="seekbar justify-center"><input id="thumb_seek" type="range" min="0" max="0" value="0" step="1">
            <div class="timer">time</div></div>
            <div class="vol-ctrl flex items-center"><div class="vol-range"><input id="volume-slider" type="range" min="0" max="100" value="50"></div><div class="volume"><svg width="20px" height="20px" viewBox="15 4 20 40" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00048000000000000007"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 0h48v48H0z" fill="none"></path> <g id="Shopicon"> <g> <polygon points="24,42.16 24,5.835 11.303,15.999 4,15.998 4,31.998 11.303,31.999 "></polygon> <path d="M28,27.999v4c4.411,0,8-3.589,8-8s-3.589-8-8-8v4c2.206,0,4,1.794,4,4S30.206,27.999,28,27.999z"></path> <path d="M44,23.999c0-9.374-7.626-17-17-17v4c7.168,0,13,5.832,13,13s-5.832,13-13,13v4C36.374,40.999,44,33.373,44,23.999z"></path> </g> </g> </g></svg></div></div>
            <div class="msc-pre-nxt flex items-center"><div><svg width="30px" height="30px" viewBox="0 -2 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>previous [#999]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-104.000000, -3805.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M59.9990013,3645.86816 L59.9990013,3652.13116 C59.9990013,3652.84516 58.8540013,3653.25316 58.2180013,3652.82516 L53.9990013,3650.14016 L53.9990013,3652.13116 C53.9990013,3652.84516 53.4260013,3653.25316 52.7900013,3652.82516 L48.4790013,3649.69316 C47.9650013,3649.34616 47.7980013,3648.65316 48.3120013,3648.30616 L52.7900013,3645.17516 C53.4260013,3644.74616 53.9990013,3645.15416 53.9990013,3645.86816 L53.9990013,3647.85916 L58.2180013,3645.17516 C58.8540013,3644.74616 59.9990013,3645.15416 59.9990013,3645.86816" id="previous-[#999]"> </path> </g> </g> </g> </g></svg></div><div><svg width="30px" height="30px" viewBox="0 -2 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>next [#998]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-144.000000, -3805.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M99.684,3649.69353 L95.207,3652.82453 C94.571,3653.25353 94,3652.84553 94,3652.13153 L94,3650.14053 L89.78,3652.82453 C89.145,3653.25353 88,3652.84553 88,3652.13153 L88,3645.86853 C88,3645.15453 89.145,3644.74653 89.78,3645.17453 L94,3647.85953 L94,3645.86853 C94,3645.15453 94.571,3644.74653 95.207,3645.17453 L99.516,3648.30653 C100.03,3648.65353 100.198,3649.34653 99.684,3649.69353" id="next-[#998]"></path></g></g></g></g></svg></div></div>`;
            playBar.innerHTML = html;
            document.querySelector('.player-par').appendChild(playBar);

            playBar.querySelector('.msc-pre-nxt').addEventListener('click', (e) => {
                let i = 0;
                for (i = 0; i < songsCurr.length; i++) {
                    if (songsCurr[i].href == aud.src) {
                        break;
                    }
                }
                if (e.target.closest('div') == e.currentTarget.children[0]) {
                    if (i == 0) i = songsCurr.length;
                    playSong(document.getElementsByClassName('lib-msc')[0].children[i - 1]);
                } else {
                    if (i == songsCurr.length - 1) i = -1;
                    playSong(document.getElementsByClassName('lib-msc')[0].children[i + 1]);
                }
            })

            ppSvg = document.getElementById('pause-play');
            ppSvg.addEventListener('click', function () {
                if (playin) {
                    aud.pause();
                    playin = false;
                    toggle();
                } else {
                    try {
                        aud.play();
                        playin = true;
                        toggle();
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
            res('done');
        })

        currSong.addEventListener('error', () => {
            rej('could not load audio');
        })
    })
}

document.addEventListener('keypress', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (aud) {
            if (playin) {
                playin = false;
                aud.pause();
                toggle();
            } else {
                playin = true;
                aud.play();
                toggle();
            }
        }
    }
})

document.getElementsByClassName('hamburger')[0].addEventListener('click', (e) => {
    const a = document.getElementsByClassName('container')[0];
    if (a.children[0].style.marginLeft != '0vw') {
        a.children[0].style.marginLeft = '0vw'
        a.children[1].style.marginRight = '-80vw'
        a.children[0].style.opacity = '1'
        document.body.style.overflow = 'hidden'
        document.getElementsByClassName('footer')[0].width = '80vw'
        document.getElementsByClassName('player-par')[0].marginLeft = '-80vw'
        e.currentTarget.children[1].style.display = 'block';
        e.currentTarget.children[0].style.display = 'none';
    }

    else {
        a.children[0].style.marginLeft = '-80vw'
        a.children[1].style.marginRight = '0vw'
        a.children[0].style.opacity = '0'
        e.currentTarget.children[1].style.display = 'none';
        e.currentTarget.children[0].style.display = 'block';
    }
})

function create_cardList_heading(heading) {
    let a = document.createElement('div');
    a.classList.add('flex', 'items-center');
    a.innerHTML = `<span>${heading}</span>
                    <button>Show all</button>`;
    return a;
}
function create_cardList_card(name, sub_name, imgLink, songLink) {
    let c = document.createElement('div');
    c.classList.add('card');
    c.innerHTML = `<img style="height:70%" src="${imgLink}" alt="poster">
                    <ul>
                        <h4>${name}<button><svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="-8 -8 40 40" class="Svg-sc-ytk21e-0 bneLcE"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg></button></h4>
                        <p>${sub_name}</p>
                        <a href="${songLink}"></a>
                    </ul>`;
    return c;
}
async function card_list_maker(heading, link) {
    let card_list = document.createElement('div');
    card_list.classList.add('cards-list');

    card_list.appendChild(create_cardList_heading(heading));

    let b = document.createElement('div')
    b.classList.add('flex', 'more-songs');
    let songList=await getSongs(link.split('/').slice(-1)[0]);
    for (let i = 0; i <songList.length; i++) {
    let meta;
    await new Promise((res) => {
        jsmediatags.read(songList[i].href, {
            onSuccess: function (tag) {
                const data = tag.tags.picture.data;
                const format = tag.tags.picture.format;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                let img = `data:${format}; base64, ${window.btoa(base64String)}`;
                b.appendChild(create_cardList_card(tag.tags.title, tag.tags.artist, img, songList[i].href));
                res();
             },
            onError: function (error) { console.log(error); res('this song could not be retrieved, but error resolved because next song has also to be loaded'); }
        })
    });
        console.log('here');
    }
    card_list.appendChild(b);
    document.getElementsByClassName('main-content')[0].appendChild(card_list);
    b.addEventListener('click',(e)=>{
    let par=e.target.closest('.card');
    if(document.querySelector('.lib-msc').children.length!=songList.length){
        document.querySelector('.lib-msc').innerHTML='';
        console.log('change library elft');
        main(heading);
    }
    playSong(null, par.querySelector('a').getAttribute('href'), par/* library address*/);
    })
}

(async () => {
    let songsFolder = await fetch('/songs/')
    songsFolder = await songsFolder.text();
    // console.log(songsFolder);
    let div = document.createElement('div');
    div.innerHTML = songsFolder;
    // console.log(div);
    
    let focus = div.querySelector('table').children[0];//get all subfolders in songs(libraries)
    console.log(focus);
    
        for (let i = 2; i < focus.children.length; i++) {
            console.log(focus.children[i].querySelector('a').href, focus.children[i].querySelector('a').innerText);
            card_list_maker(focus.children[i].querySelector('a').innerText.slice(0, -1), focus.children[i].querySelector('a').href.slice(0, -1));
            //make card-List for all subfolders/libraries
        }
    // card_list_maker('pop', 'http://127.0.0.1:3000/songs/pop');
    // card_list_maker('recent', 'http://127.0.0.1:3000/songs/recent');
    // this is not dynamic, hardcoded hai fix the dynamic portion line 329-343
}
)();