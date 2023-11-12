"use client";

import { useState } from "react";

const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const [disableSubmitButton, setDisableSubmitbutton] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const toggleModal = (e) => {
    e.preventDefault();
    setOpenModal((prev) => !prev);
  };

  const [formValues, setFormValues] = useState({
    transcription_language: "en-US",
    resource_file: null,
    resource_link: "",
    enable_speaker_identification: false,
  });

  const [errors, setErrors] = useState({});

  const handleTranscriptionLanguage = (transcription_language) => {
    if (validateTranscriptionLanguage(transcription_language)) {
      setFormValues({ ...formValues, transcription_language });
      activateSubmitButton();
    }
  };

  const handleUrlChange = (resource_link) => {
    if (resource_link) {
      if (validateURL(resource_link)) {
        setFormValues({ ...formValues, resource_link });
        activateSubmitButton();
      } else {
        activateSubmitButton();
      }
    } else {
      setFormValues({ ...formValues, resource_link });
      activateSubmitButton();
    }
  }

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0){
      if (validateFile(e.target.files[0])) {
        setFormValues({ ...formValues, resource_file: e.target.files[0]});
        activateSubmitButton();
      }
    }
  };

  const handleSpeakerIdentification = () => {
    setFormValues({ ...formValues, enable_speaker_identification: !formValues.enable_speaker_identification });
  }

  const validateTranscriptionLanguage = (transcription_language) => {
    if (!transcription_language || transcription_language.trim() === ""){
      setErrors({ ...errors, transcription_language: "Please Select a transcription language" });
      return false;
    }
    return true;
  }

  const validateURL = (url) => {

    let isValid = true;

    const supportedHosts = ['drive.google.com', 'www.dropbox.com', 'www.youtube.com'];
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
  
    if (!url || !urlPattern.test(url)) {
      setErrors({ ...errors, resource_link: "Please replace with a valid URL" });
      isValid = false;
    } else {
      setErrors({ ...errors, resource_link: "" });
    }

    try {
      const hostname = new URL(url).hostname;
      if (
        !supportedHosts.includes(hostname) && 
        (
          hostname !== 'drive.google.com' && url.includes('/file/d/') || 
          hostname !== 'www.dropbox.com' && url.includes('/s/') ||
          hostname !== 'www.youtube.com'
        )
      ) {
        setErrors(
          { ...errors, resource_link: "URL is valid but not from our supported host: Google or dropbox or Youtube" }
        );
        isValid = false;
      } else {
        setErrors({...errors, resource_link: ""});
      }
    } catch(_) {
      setErrors({ ...errors, resource_link: "Invalid URL" });
    }

    return isValid;
  };

  const validateFile = (resourceFile) => {

    let isValid = true;

    const maxSize           = Math.floor(1024 * 1024 * 10); //10MB
    const acceptedFileTypes = [
      "audio/mpeg",
      "video/mp4", 
      "audio/wav", 
      "audio/x-caf", 
      "audio/aiff", 
      "video/x-msvideo", 
      "application/vnd.rn-realmedia-vbr", 
      "video/x-flv", 
      "audio/x-m4a", 
      "video/quicktime", 
      "video/x-ms-wmv", 
      "video/x-ms-wma"
    ];

    const fileSize = resourceFile.size;
    const fileType = resourceFile.type;

    if (fileSize > maxSize) {
      setErrors({ ...errors, resource_file : "File size shouldn't exceed " + maxSize + " bytes" });
      isValid = false;
    } else {
      setErrors({ ...errors, resource_file : "" });
    }

    if (!acceptedFileTypes.includes(fileType)) {
      setErrors(
        { ...errors, resource_file: "Unsupported file extension. Allowed Extensions are listed above"}
      );
      isValid = false;
    } else {
      setErrors({ ...errors, resource_file : "" });
    }

    return isValid;
  };

  const activateSubmitButton = () => {
    setDisableSubmitbutton(
      (prev) => {
        Object.keys(errors).length > 0 ? prev === true ? prev : false : false
      }
    );
  };

  const validateFormFields = () => {

    let isValid = true;

    if (!validateTranscriptionLanguage(formValues.transcription_language)) {
      isValid = false;
    }
    
    if (formValues.resource_link && !validateURL(formValues.resource_link)) {
      isValid = false;
    }

    if (formValues.resource_file && !validateFile(formValues.resource_file)) {
      isValid = false;
    }

    if (formValues.resource_file && formValues.resource_link){
      setErrors(
        { ...errors, form_submit: "You can't upload a resource file and provide an import link simultaneously" }
      );
      isValid = false;
    } else if (!formValues.resource_file && !formValues.resource_link) {
      setErrors({ ...errors, form_submit: "Please upload a resource file or provide an import link" });
      isValid = false;
    } else {
      setErrors({ ...errors, form_submit: "" });
    }

    return isValid;
  };

  const handleTranscriptionForm = async (e) => {
    e.preventDefault();

    // Check if there are any errors
    if (!validateFormFields()){
      setErrors({ ...errors, form_submit: "There are some errors on the form fields. please cross-check and try again" });
      activateSubmitButton();
    } else {
      setErrors({ ...errors, form_submit: "" });
      setDisableSubmitbutton(true);

      try {
        // console.log(formValues);
        await submitData(formValues);
        setDisableSubmitbutton(false);
      } catch(err){
        console.log(err);
        setErrors({ ...errors, form_submit: "Something went wrong, failed to submit form" });
        setDisableSubmitbutton(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormValues({
      transcription_language: "en-US",
      resource_file: null,
      resource_link: "",
      enable_speaker_identification: false,
    });
    setErrors({});
    setOpenModal(false);
  };

  const submitData = async (data) => {
    try {

      const formData = new FormData();
      formData.append("transcription_language", data.transcription_language);
      formData.append("resource_file", data.resource_file);
      formData.append("resource_link", data.resource_link);
      formData.append("enable_speaker_identification", data.enable_speaker_identification);

      const response = await fetch("http://localhost:8000/api/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.detail);
        setTimeout(() => {
          setSuccessMessage("");
          resetForm();
        }, 3000);
      } else {
        const error = await response.json();
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
            onClick={toggleModal}
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
              onClick={toggleModal}
            ></span>
            <h4 className="font-bold text-xl mb-8">Transcribe File</h4>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleTranscriptionForm}
            >
              {/* Transcription Language */}
              <div className="flex flex-col gap-3">
                <label className="font-medium" htmlFor="transcriptionLanguage">
                  Transcription Language
                </label>
                <select
                  name="transcription_language"
                  id="transcriptionLanguage"
                  onChange={(e) => handleTranscriptionLanguage(e.target.value)}
                  className="p-3 outline-none border border-gray-100 rounded-lg ring-2 ring-transparent hover:ring-blue-100 focus:ring-blue-200"
                >
                  <option value="en-US">Default English</option>
                  <option disabled>Upgrade your account to explore more options</option>
                </select>
                {errors.transcription_language && (<small className="text-red-300">{errors.transcription_language}</small>)}
              </div>

              {/* Resource File */}
              <div className="p-5 border border-gray-100 rounded-lg flex flex-col gap-5 justify-center items-center">
                <p>
                  {formValues.resource_file ? formValues.resource_file.name : "No file selected"}&nbsp;
                  {formValues.resource_file && (
                    <span 
                      className="text-red-500 cursor-pointer text-xl" 
                      onClick={() => setFormValues({ ...formValues, resource_file: null})}
                    >
                      &times;
                    </span>
                  )}
                </p>
                <div className="relative block mt-5 mb-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    name="resource_file"
                    id="resourceFile"
                    accept=".mp3, .mp4, .wav, .caf, .aiff, .avi, .rmvb, .flv, .m4a, .mov, .wmv, .wma"        
                    max={1024 * 1024 * 1024}
                    className="z-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0"
                  />
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                    <span className="bi-cloud text-3xl text-blue-700"></span>
                  </div>
                </div>
                <label htmlFor="resourceFile" className="font-medium">
                  <span className="text-blue-700 cursor-pointer">Click to Upload</span> or drag
                  and drop
                </label>
                <small className="text-center text-sm text-gray-400">
                  The maximum file size is 1Gb for both audios and videos.{" "}
                  <br />
                  Supported formats are mp3, mp4, wav, caf, aiff, avi, rmvb,
                  flv, m4a, mov, wmv, wma
                </small>
                {errors.resource_file && (<small className="text-red-500">{errors.resource_file}</small>)}
              </div>

              {/* Resource Link */}
              <div className="flex flex-col gap-3">
                <label className="font-medium" htmlFor="resourceLink">
                  Import from link
                </label>
                <input
                  type="url"
                  name="resource_link"
                  id="resourceLink"
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Paste a Dropbox, Google Drive or YouTube URL here"
                  className="p-3 outline-none border border-gray-100 rounded-lg ring-2 ring-transparent hover:ring-blue-100 focus:ring-blue-200"
                />
                {errors.resource_link && (<small className="text-red-500">{errors.resource_link}</small>)}
              </div>

              {/* Speaker Identification */}
              <div className="inline-flex gap-3 items-center">
                <input
                  type="checkbox"
                  name="enable_speaker_identification"
                  id="enableSpeakerIdentification"
                  onChange={handleSpeakerIdentification}
                  checked={formValues.enable_speaker_identification}
                />
                <label 
                  htmlFor="enableSpeakerIdentification"
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
              {errors.form_submit && ( <small className="text-red-500">{errors.form_submit}</small> )}

              {/* Display Success */}
              {successMessage && ( <small className="text-green-500">{successMessage}</small> )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
