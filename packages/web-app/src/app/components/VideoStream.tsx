const VideoStream = () => {
  const videoUrl = "https://animation-service-wn3n4mhgfq-ez.a.run.app/generate-video";

  return (
    <div>
      <h1>Manim Video Stream</h1>
      <video controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoStream;