window.addEventListener("load", (event) => {
  qrScanner();
});

// GLOBAL VarrIABLES
var ticket, last_ticket, ticket_count;
var processing = false;
var base_url;
var responseTxt; 
var scan_history = new Array();
var cameraId;
var cameras = 0;
var camera = 1;
var scan_count = 0;



// sound file path
var success_beep = "./sounds/Barcode-scanner-beep-sound.mp3";
var expired_beep = "./sounds/Beep-beep-sound-effect.mp3";
var error_beep = "./sounds/Error-sound.mp3";

// icon file path
var success_img = "success.png";
var expired_img = "expired.png";
var error_img = "invalid.png";
var next_img = "next.png";



//  QRCode scanner
function qrScanner(params) {
  const html5QrCode = new Html5Qrcode("reader");
  const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    ticketVerification(decodedText);
  };
  // const config = { fps: 30, qrbox: { width: 250, height: 250 }, disableFlip:true };
  const config = {
    fps: 30,
    qrbox: {width: 250, height: 250},
    rememberLastUsedCamera: true,
    // Only support camera scan type.
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
  };

  // This method will trigger user permissions
  Html5Qrcode.getCameras()
    .then((devices) => {
      // devices would be an array of objects of type
      for (let index = 0; index < devices.length; index++) {
        
      }
      if (devices && devices.length) {
        cameras = devices.length;

        if (cameras < 2) {
          camera = 0;
        }
        // cameraId = devices[camera].id;
        // .. use this to start scanning.
        html5QrCode.start(
          // { deviceId: { exact: cameraId } },
          { facingMode: (camera == 0) ? "user" : "environment" },
          config,
          qrCodeSuccessCallback
        );
      }
    })
    .catch((err) => {
      // handle err
    });

}

function manualScan() {
  var m_ticket = document.getElementById("ticket_number").value;

  if (m_ticket) {
    ticketVerification(m_ticket);
  }
  else{
    alert("Pleas enter ticket number");
  }
}

//
function ticketVerification(decodedText) {
    ticket = decodedText;
    base_url = `https://buses.all1zed.com/api/${ticket}/scan`;
  if (ticket && ticket !== last_ticket && !processing) {
    processing = true;
        scan_count++;
        document.getElementById("processor-cont").className = "processing";
        last_ticket = ticket;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            updateUI(this.responseText);
        }else if(this.readyState == 4 && this.status == 404){
            updateUI('{"status":"failed"}');
        }
        
    };

    xhttp.open("GET",base_url, true);
    xhttp.send();
  }
}

//
function updateUI(response) {
  var arr = JSON.parse(response);

  if (arr.status == "success") {
    beepControl(success_beep);
    setIcon(success_img);
  } else if (arr.status == "failed" && arr.message == "Already Scanned") {
    beepControl(expired_beep);
    setIcon(expired_img);
  } else if (arr.status == "failed" && arr.message != "Already Scanned") {
    beepControl(error_beep);
    setIcon(error_img);
  }

  getTicketDetails(arr);

  //
  document.getElementById("scan_count").innerText = scan_count;
  document.getElementById("processor-cont").className = "not-processing";
  processing = false;
  setTimeout(() => {
    setIcon(next_img);
  }, 1200);

  
  setTimeout(() => {
    last_ticket = '';
  }, 5000);


}

function getTicketDetails(ticketDetails) {
  document.getElementById('ticket_number').value = ticket;
  document.getElementById('message').innerHTML = ticketDetails.message;
  if(ticketDetails.status == "success" || ticketDetails.message == "Already Scanned"){
      document.getElementById('names').value = ticketDetails.full_name;
      document.getElementById('phone').value = ticketDetails.phone_number;
  }else{
      document.getElementById('names').value = "";
      document.getElementById('phone').value = "";
  }

}

// fla
function setIcon(filePath) {
  document.getElementById("result_icon").setAttribute("src", filePath);
}

//
function beepControl(sound) {
    const beep = new Audio(sound);
    beep.play();
}


function camSwitch() {
  if (cameras) {
    if (cameras > 1 && (camera + 1) < cameras) {
      ++camera;
      // cameraId = activeCamera;
    }else{
      camera = 0;
    }
  }

  qrScanner();
}
