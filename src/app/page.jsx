"use client";

import { useState } from "react";

const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const [disableSubmitButton, setDisableSubmitbutton] = useState(true);

  const [transcriptionLang, setTranscriptionLang] = useState("en-US");
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceLink, setResourceLink] = useState("");
  const [speakerIdentification, setSpeakerIdentification] = useState(false);

  const [transcriptionLangErr, setTranscriptionLangErr] = useState("");
  const [resourceFileErr, setResourceFileErr] = useState("");
  const [resourceLinkErr, setResourceLinkErr] = useState("");
  const [errors, setErrors] = useState([]);

  // const submitBtn = document.querySelector("#submitBtn");

  const handleModal = (e) => {
    e.preventDefault();
    setOpenModal((prev) => !prev);
  }; 

  const validateURL = (url) => {
    const supportedHosts = ['drive.google.com', 'www.dropbox.com', 'www.youtube.com'];
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/;
  
    const match = url.match(urlPattern);
      if (!match) {
        setResourceLinkErr("Please replace with a valid URL");
        return false; // Invalid URL
      } else {
        setResourceLinkErr("");
      }
  
      const hostname = new URL(url).hostname;
      if (supportedHosts.includes(hostname)) {
        setResourceLinkErr("");
        if (hostname === 'drive.google.com' && url.includes('/file/d/')) {
          return 'Google Drive'; // Google Drive link
        } else if (hostname === 'www.dropbox.com' && url.includes('/s/')) {
          return 'Dropbox'; // Dropbox link
        } else if (hostname === 'www.youtube.com') {
          return 'YouTube'; // YouTube link
        }
      }
  //aakasha063@gmail.com
      setResourceLinkErr("URL is valid but not from the supported services");
      return false; // URL is valid but not from the supported services
  }

  const isTranscriptionLangValid = () => {
    if (transcriptionLang.trim() === "") {
      setTranscriptionLangErr("Please Select a transcription language");
      return false;
    } else {
      setTranscriptionLangErr("");
      return true;
    }
  };

  const isResourceFileValid = () => {
    return resourceFile !== null;
  };

  const isResourceLinkValid = () => {
    if (resourceLink.trim() === "") {
      return false;
    }

    // Use the validateURL function to check the link
    const linkValidationResult = validateURL(resourceLink);

    // If the validation result is one of the supported services, it's valid
    return linkValidationResult === 'Google Drive' || linkValidationResult === 'Dropbox' || linkValidationResult === 'YouTube';
  };


  const validateFields = () => {
    const validTranscriptionLang = isTranscriptionLangValid();
    const validResourceFile = isResourceFileValid();
    const validResourceLink = isResourceLinkValid();
    
    return (validTranscriptionLang && (validResourceFile || validResourceLink));
  };

  const activateSubmitButton = () => {
    setDisableSubmitbutton(!validateFields());
  };

  const handleFileSelection = (e) => {
    const inputedFile = e.target.files[0];
    const maxSize     = Math.floor(1024 * 1024 * 1024);
    const allowedExtensions = [".mp3", ".mp4", ".wav", ".caf", ".aiff", ".avi", ".rmvb", ".flv", ".m4a", ".mov", ".wmv", ".wma"];

    if (inputedFile){
      const fileSize = inputedFile.size;
      const fileExtension = '.' + inputedFile.name.split('.').pop().toLowerCase();

      if(fileSize > maxSize){
        setResourceFileErr("File size shouldn't exceed " + maxSize + " bytes");
        inputedFile.value = "";
        setResourceFile(null);
        activateSubmitButton();
        return;
      } else if (!allowedExtensions.includes(fileExtension)){
        setResourceFileErr("Unsupported file extension. Allowed Extensions: " + allowedExtensions.join(", "));
        inputedFile.value = "";
        setResourceFile(null);
        activateSubmitButton();
        return;
      } else {
        setResourceFileErr("");
        setResourceFile(inputedFile);
        activateSubmitButton();
      }
    } else {
      setResourceFile(null);
      setResourceFileErr("");
      activateSubmitButton();
    }
  };

  const handleTranscriptionForm = async (e) => {
    e.preventDefault();

    if (!isResourceFileValid() && !isResourceLinkValid()) {
      setErrors(["You must upload a file locally or use an import link"]);
    } else if (isResourceFileValid() && isResourceLinkValid()) {
      setErrors(["You cannot upload the resource from a local file and use an import link simultaneously"]);
    } else if (!isTranscriptionLangValid()) {
      setErrors(["Please select a transcription language"]);
    } else {
      setErrors([]);

      try {
        const data = {
          transcription_language: transcriptionLang,
          resource: resourceFile ? resourceFile : resourceLink,
          enable_speaker_identification: speakerIdentification
        }
        await submitData(data);
        resetForm();
      } catch(err){
        console.log(err);
        setErrors((prev) => ([...prev, "Something went wrong"]));
        resetForm();
      }
    }
  };


  const resetForm = () => {
    setResourceFile(null);
    setResourceLink("");
    setTranscriptionLang("en-US");
    setSpeakerIdentification(false);
    activateSubmitButton();
  };

  const submitData = async (data) => {
    try {

      const formData = new FormData();
      formData.append("transcription_language", data.transcription_language);
      formData.append("resource", data.resource);
      formData.append("enable_speaker_identification", data.enable_speaker_identification);

      const res = await fetch("http://localhost:8000/api/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        console.log(result);
      } else {
        const error = await res.json();
        console.log(error);
      }
    } catch (err) {
      console.error("An Error ocurred: ", err);
    }
  }

  const dashboardDisplay = [
    {
      icon: "bi-folder",
      count: 100,
      text: "Uploaded Files",
    },
    {
      icon: "bi-fonts",
      count: 50,
      text: "Transcribed Files",
    },
    {
      icon: "bi-bookmark",
      count: 20,
      text: "Saved Files",
    },
  ];

  const recentFiles = [
    {
      name: "Peng Zu",
      type: "Audio",
      duration: "20",
      date_created: "1/5/2023",
      last_updated: "25/6/2023",
    },
    {
      name: "Wole Talks",
      type: "Video",
      duration: "100",
      date_created: "1/5/2023",
      last_updated: "25/6/2023",
    },
    {
      name: "Ekene Smart",
      type: "Audio",
      duration: "30",
      date_created: "1/5/2023",
      last_updated: "25/6/2023",
    },
    {
      name: "Naomi Igimoh",
      type: "SML10025",
      duration: "3000",
      date_created: "1/6/2023",
      last_updated: "01/11/2023",
    },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col gap-8 bg-gray-50 py-12 px-8">
        <section className="flex justify-between items-start">
          <header>
            <h2 className="font-semibold text-2xl mb-2">Welcome Nathanael</h2>
            <p>Upload your audio/video files to convert them to text</p>
          </header>
          <button
            className="w-max bg-blue-700 px-3 py-2 rounded-lg text-white"
            onClick={(e) => handleModal(e)}
          >
            Transcribe File
          </button>
        </section>
        <section className="grid grid-cols-12 gap-3">
          {dashboardDisplay &&
            dashboardDisplay.map((display, i) => (
              <div
               className="col-span-4 p-3 flex flex-col gap-4 bg-white rounded-lg shadow-sm"
                key={i}
              >
                <div className="w-10 h-10 inline-flex border rounded-full justify-center items-center">
                  <span className={display.icon}></span>
                </div>
                <span className="font-medium text-lg">{display.count}</span>
                <p>{display.text}</p>
              </div>
            ))}
        </section>
        <section className="bg-white p-5 rounded-lg">
          <h4 className="font-bold">Recent Files</h4>
          <hr className="my-4 text-gray-200" />
          <div className="grid grid-cols-7 items-center p-3 text-sm bg-blue-100 font-medium">
            <input type="checkbox" />
            <span>Name</span>
            <span>Type</span>
            <span>Duration</span>
            <span>Date Created</span>
            <span>Last Updated</span>
            <span>Action</span>
          </div>
          {recentFiles &&
            recentFiles.map((recentFile, i) => (
              <div
                className="grid grid-cols-7 items-center py-4 px-3 text-sm border-b border-b-gray-100 last:border-b-0"
                key={i}
              >
                <input
                  type="checkbox"
                  name={`checkbox_${i}`}
                  id={`checkbox${i}`}
                  className="w-auto"
                />
                <span>{recentFile.name}</span>
                <span>{recentFile.type}</span>
                <span>{recentFile.duration}</span>
                <span>{recentFile.date_created}</span>
                <span>{recentFile.last_updated}</span>
                <div className="flex items-center gap-4">
                  <span className="bi-pen text-yellow-400"></span>
                  <span className="bi-trash text-red-500"></span>
                </div>
              </div>
            ))}
        </section>
      </div>
      {openModal && (
        <div className="block fixed left-0 top-0 w-full h-full bg-black bg-opacity-60 z-40 overflow-auto">
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 bg-white p-5 rounded-lg shadow-sm shadow-white">
            <span
              className="bi-x-lg cursor-pointer absolute top-4 right-4 hover:text-red-500"
              onClick={handleModal}
            ></span>
            <h4 className="font-bold text-xl mb-8">Transcribe File</h4>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleTranscriptionForm}
            >
              {/* Transcription Language */}
              <div className="flex flex-col gap-3">
                <label className="font-medium" htmlFor="transcriptionLang">
                  Transcription Language
                </label>
                <select
                  name="transcription_language"
                  id="transcriptionLang"
                  onChange={(e) => setTranscriptionLang(e.target.value)}
                  className="p-3 outline-none border border-gray-100 rounded-lg ring-2 ring-transparent hover:ring-blue-100 focus:ring-blue-200"
                >
                  <option value="en-US">Default English</option>
                  <option disabled>Upgrade your account to explore more options</option>
                </select>
                <small className="text-red-300">{transcriptionLangErr}</small>
              </div>

              {/* Resource File */}
              <div className="p-5 border border-gray-100 rounded-lg flex flex-col gap-5 justify-center items-center">
                <span>{resourceFile ? resourceFile.name : "No file selected"}</span>
                <div className="relative block mt-5 mb-4">
                  <input
                    type="file"
                    onChange={handleFileSelection}
                    name="file_location"
                    id="fileLocation"
                    accept=".mp3, .mp4, .wav, .caf, .aiff, .avi, .rmvb, .flv, .m4a, .mov, .wmv, .wma"        
                    max={1024 * 1024 * 1024}
                    className="z-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0"
                  />
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                    <span className="bi-cloud text-3xl text-blue-700"></span>
                  </div>
                </div>
                <label htmlFor="fileLocation" className="font-medium">
                  <span className="text-blue-700 cursor-pointer">Click to Upload</span> or drag
                  and drop
                </label>
                <small className="text-center text-sm text-gray-400">
                  The maximum file size is 1Gb for audio and 10Gb for videos.{" "}
                  <br />
                  Supported formats are mp3, mp4, wav, caf, aiff, avi, rmvb,
                  flv, m4a, mov, wmv, wma
                </small>
                <small className="text-red-500">{resourceFileErr}</small>
              </div>

              {/* Resource Link */}
              <div className="flex flex-col gap-3">
                <label className="font-medium" htmlFor="fileLink">
                  Import from link
                </label>
                <input
                  type="url"
                  name="file_link"
                  id="fileLink"
                  onChange={(e)=>setResourceLink(e.target.value)}
                  onBlur={activateSubmitButton}
                  value={resourceLink}
                  placeholder="Paste a Dropbox, Google Drive or YouTube URL here"
                  className="p-3 outline-none border border-gray-100 rounded-lg ring-2 ring-transparent hover:ring-blue-100 focus:ring-blue-200"
                />
                <small className="text-red-500">{resourceLinkErr}</small>
              </div>

              {/* Speaker Identification */}
              <div className="inline-flex gap-3 items-center">
                <input
                  type="checkbox"
                  name="speaker_identification"
                  id="speakerIdentification"
                  onChange={() => setSpeakerIdentification(prev => !prev)}
                />
                <label 
                  htmlFor="speakerIdentification"
                >
                  {" "}
                  Speaker identification
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="submitBtn"
                type="submit"
                className={`w-full py-2 px-3 rounded-lg text-white ${disableSubmitButton ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-300': 'bg-blue-700 hover:bg-blue-900'}`}
                disabled={disableSubmitButton}
              >
                Tanscribe file
              </button>

              {/* Display Errors */}
              {errors && errors.map((err, i) => (
                <div className="block text-red-500" key={i}>{err}</div>
              ))}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
