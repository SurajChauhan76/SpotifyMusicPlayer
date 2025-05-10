// console.log("Lets write java script")
let songs = [];
let currFolder;
let songListArray;
let currentSong = new Audio(); //creating global variable currentSong for storing the song fetched: It is required to play one song at a time currently

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/02Project/SpotifyClone/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    // console.log(response);
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]); //split(parameter): splits the given string into two arrays, [0]-before the parameter and [1]-after the parameter. Here 2nd one is taken as it has song name
        }
    }

    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]; //first selecting the first element of class songlist, then again selecting the element ul by tag name inside first[0] ul adding the songs
    songsUL.innerHTML = ""  //Keeping songsUL as blank to populate songs each time
    // console.log("query selector on .songlist", songsUL)
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li>
                        <div>
                            <img class="invert" src="img/music.svg" alt="music">
                            <div class="songInfo"><p>${song.replaceAll("%20", " ")}</p> <p>Aritst name</p></div>
                        </div>
                        <div class="playnow">
                            <span><p>Play</p> <p>now</p></span>
                            <span><img class="playNowBtn invert" src="img/play.svg" alt="play"></span>
                        </div></li>`;
    }

    //Making an array of the list items
    songListArray = Array.from(document.querySelector(".songlist").getElementsByTagName("li"));
    songListArray.forEach(e => {
        // console.log(e.querySelector(".songInfo").firstElementChild.innerHTML); //Getting song from the list item(li)

        //Attaching event listener to each song
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML);//after innerHTML.trim() can be used to remove spaces if it contains
            // playNowBtn.src = "img/pause.svg";
            // console.log("lists of list: " , e)
            // console.log(e.querySelector(".playnow").lastElementChild.firstElementChild)
            e.querySelector(".playnow").lastElementChild.firstElementChild.src = "img/pause.svg";
        })
    });
}

const playMusic = (songTrack, pause = false) => {
    // let audio = new Audio("/02Project/SpotifyClone/songs/" + songTrack) //If currentSong global variable is not created then current clicked may or not play or in the queue some songs will not play followed by once one song is clicked 
    currentSong.src = `/02Project/SpotifyClone/${currFolder}/` + songTrack; //.src: used to provide the url of the song to currentSong global variable

    if (!pause) {
        currentSong.play();
        playSongBtn.src = "img/pause.svg";

    }
    document.querySelector(".playbar-songInfo").innerHTML = decodeURI(songTrack); //as pause parameter passed into playMusic the songTrack becomes coded so we use decodeURI to display the track title of the song

}

// Function to format time in MM:SS format
function formatTime(time) {
    if (isNaN(time) || time < 0) return "00:00"; // Handle invalid cases
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to fetch the json info and cover page to create the card album
async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3000/02Project/SpotifyClone/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let arrayAnchors = Array.from(anchors)
    for (let index = 0; index < arrayAnchors.length; index++) {  //Here for each loop will hinder the card click functionalities hence traditional for loop is used
        const e = arrayAnchors[index];

        if (e.href.includes("/songs")) {
            let folderInSongs = e.href.split("/").slice(-2)[0];
            // console.log(folderInSongs) //This gives names of the folder
            //Get meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/02Project/SpotifyClone/songs/${folderInSongs}/info.json`);
            let response = await a.json(); //response stores the json meta data - title and description
            // console.log(response)
            document.querySelector(".card-container").innerHTML = document.querySelector(".card-container").innerHTML + `<div data-folder="${folderInSongs}" class="card">                    
                    <img class="play" src="img/cardPlay.svg" alt="cardPlay">                    
                    <img src="songs/${folderInSongs}/cover.jpg" alt="">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    //Adding event listener to the each card albums to load the songs it contains
    // console.log(Array.from(document.getElementsByClassName("card")))
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            // console.log(item.currentTarget.dataset.folder) //.cuurentTarget applies on card as whole or else .target will retain individual elements clicked atm

            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // console.log(songs) //After passing the folder name using dataset.folder, all the songs from that folder is loaded currently

            playMusic(songs[0]); //After loading all the songs in variable songs, passing the first song into playMusic so once web loads playbar will be set to first song and it will play also since pause condition is not passed and which is at false by default i.e. song plays
        })
    })
}

async function main() {
    //Passing the folder to get all the songs populated inside global variable songs array
    await getSongs("songs/NCS");
    playMusic(songs[0], true); //After loading all the songs in variable songs, passing the first song into playMusic so once web loads playbar will be set to first song

    //Calling the displayAlbum() function to create card albums
    displayAlbum();

    //Adding event listener to play song button to play and pause the music and to make the svg change to pause and vice-versa
    playSongBtn.addEventListener("click", () => {
        if (currentSong.paused) {  //paused: is a parameter of the Audio in js which checks if song paused or not
            currentSong.play();
            playSongBtn.src = "img/pause.svg";
            document.querySelector(".playnow").lastElementChild.firstElementChild.src = "img/pause.svg";
            // console.log(currentSong)

        } else {
            currentSong.pause();
            playSongBtn.src = "img/play.svg";
            document.querySelector(".playnow").lastElementChild.firstElementChild.src = "img/play.svg";
        }

        // songListArray.forEach(e =>{

        // }) 
    })

    //Adding event listener to the previous and next play buttons
    nextSongBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        //    console.log(songs, index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            // console.log(songs[index+1])
            // console.log("this is song list: ",songListArray[index+1].querySelector(".playnow").lastElementChild.firstElementChild)
            songListArray[index + 1].querySelector(".playnow").lastElementChild.firstElementChild.src = "img/pause.svg";
            songListArray[index].querySelector(".playnow").lastElementChild.firstElementChild.src = "img/play.svg";
        }


    })
    previousSongBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])

            songListArray[index - 1].querySelector(".playnow").lastElementChild.firstElementChild.src = "img/pause.svg";
            songListArray[index].querySelector(".playnow").lastElementChild.firstElementChild.src = "img/play.svg";
        }
    })

    //Adding event listener for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".playbar-songTime").firstElementChild.innerHTML = formatTime(currentSong.currentTime);
        document.querySelector(".playbar-songTime").lastElementChild.innerHTML = formatTime(currentSong.duration);

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

        // if (currentSong.currentTime == currentSong.duration) {
        //     playSongBtn.src = "img/play.svg";
        // } 
        songListArray.forEach(e => {
            if (currentSong.currentTime == currentSong.duration) {
                playSongBtn.src = "img/play.svg";
                e.querySelector(".playnow").lastElementChild.firstElementChild.src = "img/play.svg";
                // console.log(document.querySelector(".playnow").lastElementChild.firstElementChild)
            }
        })
    })

    //Adding event listener to the seekbar: whenever clicked on bar music updated accordingly
    document.querySelector(".seekbar").querySelector(".bar").addEventListener("click", e => {  //instead of (), name given
        let xPercentChange = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = xPercentChange + "%";
        currentSong.currentTime = ((currentSong.duration) * xPercentChange) / 100;  // current time = total time * one percent change time
    })

    //Adding event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    //Adding event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    //Adding event listener to volume button
    volumeBtn.addEventListener("click", (e) => {
        console.log(e.target.src)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            document.querySelector(".volInfo").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".volInfo").getElementsByTagName("input")[0].value = 30;
            currentSong.volume = 0.3;
        }

    })

    //Adding event listener to volume seekbar
    document.querySelector(".volInfo").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value) //e.target.value: gives the amout the range seek bar has moved
        currentSong.volume = (e.target.value) / 100; //volume ranges from 0.0 to 1.0

        if (currentSong.volume == 0) {
            volumeBtn.src = "img/mute.svg"
        } else {
            volumeBtn.src = "img/volume.svg"
        }
    })
}
main();


/*.offsetX: gives the position on x-axis or direction
.offsetY: gives the position on y-axis or direction
.target: returns the same element on which it is applied
.getBoundingClientRect(): gives the width, height and other dimensions of the box */


// audio.addEventListener("loadeddata", () => {
//     let duration = audio.duration;
//     console.log(duration);
// });