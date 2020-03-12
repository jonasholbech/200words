function loaded() {
  const card = document.querySelector(".card");
  const title = document.querySelector(".card-title");
  const text = document.querySelector(".card-text");
  const read = document.querySelector(".read");
  const hear = document.querySelector(".hear");
  const loader = document.querySelector(".loader");
  const hidden = document.querySelector(".hidden");
  //diagniostics el
  const diagnostic = document.querySelector(".output em");
  //speech synth
  var synth = window.speechSynthesis;
  var inputForm = document.querySelector("form");
  var inputTxt = document.querySelector(".txt");
  var voiceSelect = document.querySelector("select");

  var pitch = document.querySelector("#pitch");
  var pitchValue = document.querySelector(".pitch-value");
  var rate = document.querySelector("#rate");
  var rateValue = document.querySelector(".rate-value");

  var voices = [];

  //speech recog
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent =
    SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();

  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let counter = 0;
  let data = [];
  function init() {
    fetch("english.json")
      .then(res => res.json())
      .then(data => {
        setup(data.filter(d => d.s !== ""));
      });
  }
  init();
  function populateVoiceList() {
    voices = synth.getVoices();

    for (i = 0; i < voices.length; i++) {
      if (voices[i].lang.startsWith("en-GB")) {
        var option = document.createElement("option");

        option.textContent = voices[i].name + " (" + voices[i].lang + ")";

        if (voices[i].default) {
          option.textContent += " -- DEFAULT";
        }
        if (voices[i].name === "Google UK English Female") {
          option.setAttribute("selected", true);
        }

        option.setAttribute("data-lang", voices[i].lang);
        option.setAttribute("data-name", voices[i].name);
        voiceSelect.appendChild(option);
      }
    }
  }
  populateVoiceList();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }
  function speak(what) {
    read.appendChild(loader);
    read.querySelector("p").classList.add("hidden");
    var utterThis = new SpeechSynthesisUtterance(what);

    var selectedOption = voiceSelect.selectedOptions[0].getAttribute(
      "data-name"
    );
    for (i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
      }
    }
    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
    utterThis.onend = function() {
      hidden.appendChild(loader);
      read.querySelector("p").classList.remove("hidden");
    };
  }
  function setup(initialData) {
    data = initialData;
    read.addEventListener("click", e => {
      speak(data[counter].s);
    });
    hear.addEventListener("click", e => {
      listen(data[counter].s);
    });
    title.textContent = data[counter].w;
    text.textContent = data[counter].s;
  }

  function success() {
    card.classList.add("move-out");
    card.classList.remove("move-in");
    card.addEventListener("animationend", out);
    function out() {
      card.classList.remove("move-out");
      card.classList.remove("move-in");
      counter++;
      title.textContent = data[counter].w;
      text.textContent = data[counter].s;
      diagnostic.textContent = "";

      card.classList.add("move-in");
      card.removeEventListener("animationend", out);
    }
  }
  function listen(sentence) {
    hear.appendChild(loader);
    hear.querySelector("p").classList.add("hidden");
    recognition.start();
  }
  recognition.onresult = function(event) {
    var result = event.results[0][0].transcript;
    diagnostic.textContent = "Result received: " + result + ".";
    console.log("Confidence: " + event.results[0][0].confidence);
    if (event.results[0][0].transcript == data[counter].s.toLowerCase()) {
      success();
    }
  };
  recognition.onspeechend = function() {
    hidden.appendChild(loader);
    hear.querySelector("p").classList.remove("hidden");
    recognition.stop();
  };
}
loaded();

// Reference to an output container, use 'pre' styling for JSON output
var output = document.createElement("pre");
document.body.appendChild(output);

// Reference to native method(s)
var oldLog = console.log;

console.log = function(...items) {
  // Call native method first
  oldLog.apply(this, items);

  // Use JSON to transform objects, all others display normally
  items.forEach((item, i) => {
    items[i] = typeof item === "object" ? JSON.stringify(item, null, 4) : item;
  });
  output.innerHTML += items.join(" ") + "<br />";
};

// You could even allow Javascript input...
function consoleInput(data) {
  // Print it to console as typed
  console.log(data + "<br />");
  try {
    console.log(eval(data));
  } catch (e) {
    console.log(e.stack);
  }
}
