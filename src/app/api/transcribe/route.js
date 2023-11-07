export default async function POST(request) {

    const { transcription_lanuage, resource, enable_speaker_identification } = request.body;

    const externalAPIURL = "http:localhost:8000/api/transcribe";

    return Response.json();
}