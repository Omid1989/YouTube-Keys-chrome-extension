console.log('injection  content script ');
var datavtt=null;
var lang='en';
function getYouTubeVideoId() {

    var video_id = window.location.search.split('v=')[1];
    if (video_id != null) {
        var ampersandPosition = video_id.indexOf('&');

        if (ampersandPosition != -1) {
            return video_id.substring(0, ampersandPosition);
        }
        return  video_id;
    }
    return null;
}
function parse_timestamp(s) {

    //var match = s.match(/^(?:([0-9]{2,}):)?([0-5][0-9]):([0-5][0-9][.,][0-9]{0,3})/);
    // Relaxing the timestamp format:
    var match = s.match(/^(?:([0-9]+):)?([0-5][0-9]):([0-5][0-9](?:[.,][0-9]{0,3})?)/);
    if (match == null) {
        throw 'Invalid timestamp format: ' + s;
    }
    var hours = parseInt(match[1] || "0", 10);
    var minutes = parseInt(match[2], 10);
    var seconds = parseFloat(match[3].replace(',', '.'));

    return seconds + 60 * minutes + 60 * 60 * hours;
}

function getTranscriptList(){
	
	var request = new XMLHttpRequest()
	request.open('GET', 'https://www.youtube.com/api/timedtext?type=list&v='+getYouTubeVideoId(), true)
    request.onload = function (){
		
		if (request.readyState === request.DONE && request.status === 200) {
             console.log('this is track ',this.responseXML.getElementsByTagName('track')[0].getAttribute("lang_code"));
		     lang=this.responseXML.getElementsByTagName('track')[0].getAttribute("lang_code");
             // console.log(this.responseText);
                }
  
        
       
    }
    request.send()
	
}
function getYouTubeVideovtt(){
	getTranscriptList();
	console.log(lang);
    var request = new XMLHttpRequest()
    request.open('GET', 'https://www.youtube.com/api/timedtext?lang='+lang+'&v='+getYouTubeVideoId()+'&fmt=vtt', true)
    request.onload = function (){
        // console.log(this.responseXML);
        console.log(this.responseText);
        data=this.responseText;
        datavtt=data.split("\n\n").map(function (item,index) {

            if(index!=0){
                var parts = item.split("\n");
                var timestamp=parts[0].split(" --> ");
                if(timestamp[0]!='')
                    return  parse_timestamp(timestamp[0])


            }

        });

    }
    request.send()
}
window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
    getYouTubeVideovtt();

});
window.addEventListener('keydown', doKeyPress, true);
function doKeyPress(e){
   video = document.getElementsByTagName("video")[0];
    switch (e.key)
    {
      case "ArrowUp":
          e.preventDefault();
          video.playbackRate+=0.25;
          break;
      case "ArrowDown":
          e.preventDefault();
          video.playbackRate-=0.25;
          break;
      case "ArrowRight":
          e.preventDefault();
          document.getElementsByClassName("ytp-subtitles-button ytp-button")[0].click()
          break;
      case "ArrowLeft":
          e.preventDefault();
          if(datavtt==null) getYouTubeVideovtt();
          var got_back_time=0;
          datavtt && datavtt.map
          (
              function(item)
               {
                  if(item!=undefined)
                       if(item<video.currentTime)
                          got_back_time=item
                }
          )
          video.currentTime=got_back_time;
          break;
    }
}
