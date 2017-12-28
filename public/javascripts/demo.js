
(function () {
    "use strict";
    var OSMD;
    // The folder of the demo files
    var folder = "sheets/",
    // The available demos
        demos = {
            "M. Clementi - Sonatina Op.36 No.1 Pt.1": "MuzioClementi_SonatinaOpus36No1_Part1.xml",
            "M. Clementi - Sonatina Op.36 No.1 Pt.2": "MuzioClementi_SonatinaOpus36No1_Part2.xml",
            "M. Clementi - Sonatina Op.36 No.3 Pt.1": "MuzioClementi_SonatinaOpus36No3_Part1.xml",
            "M. Clementi - Sonatina Op.36 No.3 Pt.2": "MuzioClementi_SonatinaOpus36No3_Part2.xml",
            "J.S. Bach - Air": "JohannSebastianBach_Air.xml",
            "G.P. Telemann - Sonata, TWV 40:102 - 1. Dolce": "TelemannWV40.102_Sonate-Nr.1.1-Dolce.xml",
            "C. Gounod - Meditation": "CharlesGounod_Meditation.xml",
            "J.S. Bach - Praeludium In C Dur BWV846 1": "JohannSebastianBach_PraeludiumInCDur_BWV846_1.xml",
            "J. Haydn - Concertante Cello": "JosephHaydn_ConcertanteCello.xml",
            "S. Joplin - Elite Syncopations": "ScottJoplin_EliteSyncopations.xml",
            "S. Joplin - The Entertainer": "ScottJoplin_The_Entertainer.xml",
            "ActorPreludeSample": "ActorPreludeSample.xml",
            "an chloe - mozart": "an chloe - mozart.xml",
            "Beethoven - AnDieFerneGeliebte": "AnDieFerneGeliebte_Beethoven.xml",
            "das veilchen - mozart": "das veilchen - mozart.xml",
            "Dichterliebe01": "Dichterliebe01.xml",
            "mandoline - debussy": "mandoline - debussy.xml",
        },

        zoom = 1.0,
        playflag = 0,
        bpm = 120,
        rhythm = 0,
    // HTML Elements in the page
        err,
        error_tr,
        canvas,
        select,
        zoomIn,
        zoomOut,
        size,
        zoomDiv,
        custom,
        nextCursorBtn,
        resetCursorBtn,
        showCursorBtn,
        hideCursorBtn,
        playCursorBtn,
        pauseCursorBtn,
        backendSelect;

    // Initialization code
    function init() {
        var name, option;

        err = document.getElementById("error-td");
        error_tr = document.getElementById("error-tr");
        size = document.getElementById("size-str");
        zoomDiv = document.getElementById("zoom-str");
        custom = document.createElement("option");
        select = document.getElementById("select");
        zoomIn = document.getElementById("zoom-in-btn");
        zoomOut = document.getElementById("zoom-out-btn");
        canvas = document.createElement("div");
        nextCursorBtn = document.getElementById("next-cursor-btn");
        resetCursorBtn = document.getElementById("reset-cursor-btn");
        showCursorBtn = document.getElementById("show-cursor-btn");
        hideCursorBtn = document.getElementById("hide-cursor-btn");
        playCursorBtn = document.getElementById("play-cursor-btn");
        pauseCursorBtn = document.getElementById("pause-cursor-btn");
        backendSelect = document.getElementById("backend-select");

        // Hide error
        error();

        // Create select
        for (name in demos) {
            if (demos.hasOwnProperty(name)) {
                option = document.createElement("option");
                option.value = demos[name];
                option.textContent = name;
            }
            select.appendChild(option);
        }
        select.onchange = selectOnChange;

        custom.appendChild(document.createTextNode("Custom"));

        // Create zoom controls
        zoomIn.onclick = function () {
            zoom *= 1.2;
            scale();
        };
        zoomOut.onclick = function () {
            zoom /= 1.2;
            scale();
        };

        // Create OSMD object and canvas
        OSMD = new opensheetmusicdisplay.OSMD(canvas, false);
        OSMD.setLogLevel('info');
        document.body.appendChild(canvas);

        // Set resize event handler
        new Resize(
            function(){
                disable();
            },
            function() {
                var width = document.body.clientWidth;
                canvas.width = width;
                try {
                OSMD.render();
                } catch (e) {}
                enable();
            }
        );

        window.addEventListener("keydown", function(e) {
            var event = window.event ? window.event : e;
            if (event.keyCode === 39) {
                OSMD.cursor.next();
            }
        });
        nextCursorBtn.addEventListener("click", function() {
           
            OSMD.cursor.next();
            console.log(OSMD)
            //console.log(OSMD.cursor);
            //console.log(OSMD.cursor.iterator.currentVoiceEntries);
            
            var tempNotes = OSMD.cursor.getCurrentNotes();
            console.log(tempNotes);
            var Notes = []
            var duration =10;
            for(var i=0;i<tempNotes.length;i++){
                var note ={t:null,n:null,o:null};
                //note.t = tempNotes[i].Length.realValue;
                note = calMusicNote(tempNotes[i]);
                //note.o = tempNotes[i].pitch.Accidental;
                 if(note.n==0)continue;
                piano.playNote(note.n,note.o);
                Notes.push(note);
                duration = duration>note.t?note.t:duration;
            }
            console.log(Notes);
            console.log(duration);
            //console.log(OSMD.cursor.iterator.currentVoiceEntries[0].notes[0].pitch);
        });
        playCursorBtn.addEventListener("click", function() {
           
            //OSMD.cursor.next();
            //console.log(OSMD)
            //console.log(OSMD.cursor);
            //console.log(OSMD.cursor.iterator.currentVoiceEntries);
            if(playflag==0){
            playflag =1;
            play();
            }
            //console.log(OSMD.cursor.iterator.currentVoiceEntries[0].notes[0].pitch);
        });
        pauseCursorBtn.addEventListener("click", function() {
           
            //OSMD.cursor.next();
            console.log(OSMD);
            

            console.log(rhythm.denominator);
            console.log(rhythm.numerator);
            console.log(bpm);
            //console.log(OSMD.sheet.SheetPlaybackSetting.rhythm);
            //console.log(OSMD.cursor);
            //console.log(OSMD.cursor.iterator.currentVoiceEntries);
            
            playflag =0;
            //console.log(OSMD.cursor.iterator.currentVoiceEntries[0].notes[0].pitch);
        });
        resetCursorBtn.addEventListener("click", function() {
            OSMD.cursor.reset();
             console.log(OSMD.cursor.iterator.currentVoiceEntries[0].notes[0].pitch);
        });
        hideCursorBtn.addEventListener("click", function() {
            OSMD.cursor.hide();
        });
        showCursorBtn.addEventListener("click", function() {
            OSMD.cursor.show();
             console.log(OSMD.cursor.iterator.currentVoiceEntries[0].notes[0].pitch);
        });

        backendSelect.addEventListener("change", function(e) {
            var value = e.target.value;
            // clears the canvas element
            canvas.innerHTML = "";
            OSMD = new opensheetmusicdisplay.OSMD(canvas, false, value);
            OSMD.setLogLevel('info');
            selectOnChange();

        });
    }

    function play(){
        console.log("play");
        if(playflag==0)return;
         var tempNotes = OSMD.cursor.getCurrentNotes();
            //console.log(tempNotes);
            OSMD.cursor.next();
            var Notes = []
            var duration =10;
            for(var i=0;i<tempNotes.length;i++){
                var note ;
                note = calMusicNote(tempNotes[i]);
                //note.t = tempNotes[i].Length.realValue;
                
                //[note.n,note.o] = calMusicNote(tempNotes[i].pitch);
                //note.o = tempNotes[i].pitch.Accidental;
                //Notes.push(note);
                //console.log(note);
                if(note.n!=0){               
                piano.playNote(note.n,note.o);
                }
                duration = duration>note.t?note.t:duration;
            }       
            
            console.log(Notes);
            console.log(duration);
            var timer = setTimeout(play,duration*rhythm.denominator*60000/bpm);
    }
    function calMusicNote(note){
        //console.log(note);
        var tempnote ={t:0,n:0,o:0};
        tempnote.t = note.Length.realValue;
        var pitch = note.pitch;
        if(typeof(pitch)=="undefined") return tempnote;  
        //var retString = "";
        //var retStr = "";
        switch(pitch.fundamentalNote){
            case 0:
            tempnote.n ="C";
            break;
            case 2:
            tempnote.n ="D";
            break;
            case 4:
            tempnote.n ="E";
            break;
            case 5:
            tempnote.n ="F";
            break;
            case 7:
            tempnote.n ="G";
            break;
            case 9:
            tempnote.n ="A";
            break;
            case 11:
            tempnote.n ="B";
            break;
            default:
            return [0,0];
        }
        tempnote.n += (3+pitch.Octave);
        //console.log(retString);
        tempnote.o = pitch.Accidental;
        return tempnote;
    }
    function Resize(startCallback, endCallback) {

      var rtime;
      var timeout = false;
      var delta = 200;

      function resizeEnd() {
        timeout = window.clearTimeout(timeout);
        if (new Date() - rtime < delta) {
          timeout = setTimeout(resizeEnd, delta);
        } else {
          endCallback();
        }
      }

      window.addEventListener("resize", function () {
        rtime = new Date();
        if (!timeout) {
          startCallback();
          rtime = new Date();
          timeout = window.setTimeout(resizeEnd, delta);
        }
      });

      window.setTimeout(startCallback, 0);
      window.setTimeout(endCallback, 1);
    }

    function selectOnChange(str) {
        error();
        disable();
        var isCustom = typeof str === "string";
        if (!isCustom) {
            str = folder + select.value;
        }
        zoom = 1.0;
        OSMD.load(str).then(
            function() {
                return OSMD.render();
            },
            function(e) {
                error("Error reading sheet: " + e);
            }
        ).then(
            function() {
                return onLoadingEnd(isCustom);
            }, function(e) {
                error("Error rendering sheet: " + e);
                onLoadingEnd(isCustom);
            }
        );
    }

    function onLoadingEnd(isCustom) {
        // Remove option from select
        console.log("test");
        console.log(OSMD);
        rhythm = OSMD.sheet.SheetPlaybackSetting.rhythm;
        bpm = OSMD.sheet.userStartTempoInBPM;
        
        if (!isCustom && custom.parentElement === select) {
            select.removeChild(custom);
        }
        
        // Enable controls again
        enable();
    }

    function logCanvasSize() {
        size.innerHTML = canvas.offsetWidth;
        zoomDiv.innerHTML = Math.floor(zoom * 100.0);
    }

    function scale() {
        disable();
        window.setTimeout(function(){
            OSMD.zoom = zoom;
            OSMD.render();
            enable();
        }, 0);
    }

    function error(errString) {
        if (!errString) {
            error_tr.style.display = "none";
        } else {
            err.textContent = errString;
            error_tr.style.display = "";
            canvas.width = canvas.height = 0;
            enable();
        }
    }

    // Enable/Disable Controls
    function disable() {
        document.body.style.opacity = 0.3;
        select.disabled = zoomIn.disabled = zoomOut.disabled = "disabled";
    }
    function enable() {
        document.body.style.opacity = 1;
        select.disabled = zoomIn.disabled = zoomOut.disabled = "";
        logCanvasSize();
    }

    // Register events: load, drag&drop
    window.addEventListener("load", function() {
        init();
        selectOnChange();
    });
    window.addEventListener("dragenter", function(event) {
        event.preventDefault();
        disable();
    });
    window.addEventListener("dragover", function(event) {
        event.preventDefault();
    });
    window.addEventListener("dragleave", function(event) {
        enable();
    });
    window.addEventListener("drop", function(event) {
        event.preventDefault();
        if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length === 0) {
            return;
        }
        // Add "Custom..." score
        select.appendChild(custom);
        custom.selected = "selected";
        // Read dragged file
        var reader = new FileReader();
        reader.onload = function (res) {
            selectOnChange(res.target.result);
        };
        if (event.dataTransfer.files[0].name.toLowerCase().indexOf(".xml") > 0) {
            reader.readAsText(event.dataTransfer.files[0]);
        }
        else if (event.dataTransfer.files[0].name.toLowerCase().indexOf(".mxl") > 0){
            reader.readAsBinaryString(event.dataTransfer.files[0]);
        }
        else {
            alert("No vaild .xml/.mxl file!");
        }
    });
}());


var piano = (function(){
    var piano = function(){
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.audioData = new Array();
        this.base = 2;
        this.starttime=0; 
        this.meter = 0;
		this.playingNotes = [];
    }
    piano.fn = piano.prototype = {
        init:function(){
            
        },
        loadData:function(){
            var request = new XMLHttpRequest();
            var num = index+21;
            num = '000'+num;
            num = num.substr(num.length-3,3);
            console.log(num);
            var url = 'static/audio'+'/German Concert D '+num+' 083.ogg';
            console.log(url);
            request.open('GET', url,/*'static/audio/German Concert D 040 083.ogg',*/ true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
            var audioData = request.response;
            }
            request.send();
        },
        play:function(index){
            //console.log("test"+index);
            var source = this.audioCtx.createBufferSource();
            var data = Base64Binary.decode(notes[index+this.base ]);
            //console.log(prefix+notes[index+base]);
            //console.log(data);
            var that = this;
            this.audioCtx.decodeAudioData(data, function(buffer) {  
                 source.buffer = buffer;
                 source.connect(that.audioCtx.destination);
                 //source.loop = true;
                 source.start();
            });
            //music.loadfromJSON();
			//player.openSong(music);
			//player.start();
        },
        playtest:function(index,time){
            console.log("test"+index+"  "+time);
            var source = this.audioCtx.createBufferSource();
            var data = Base64Binary.decode(notes[index+this.base ]);
            //console.log(prefix+notes[index+base]);
            console.log(data);
            var that = this;
            this.audioCtx.decodeAudioData(data, function(buffer) {  
                 source.buffer = buffer;
                 source.connect(that.audioCtx.destination);
                 //source.loop = true;
                 source.start(time);
            });
        }, 
		playNote:function(Note,accdent){
            console.log("in playNote");
			this.play(noteKeys[Note]+accdent);
		}       
    }
    return new piano();

})();
