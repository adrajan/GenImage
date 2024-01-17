import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
        image: e.target.image.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({prediction})
      setPrediction(prediction);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Replicate + Next.js</title>
      </Head>

      <p>
        Generate images with Stability AI {" "}
        <a href="https://replicate.com/stability-ai/stable-diffusion">SDXL</a>:
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="text" 
        name="prompt"
         placeholder="Enter a prompt to display an image"
         className={styles.formInput}  />
        <input type="text" name="image" placeholder="Enter a image url (optional)" className={styles.formInput} />
        <button type="submit" className={styles.formButton}>Go!</button>
      </form>

      {error && <div>{error}</div>}

      {prediction && (
        <div className="prediction-image">
            {prediction.output && (
              <div className="prediction-image">
                <h2>Prediction Result:</h2>
                <Image src={prediction.output[prediction.output.length - 1]} 
                alt="Prediction Image" 
                layout="responsive"
                width={500} 
                height={300} />
              </div>
            )}
            <p>status: {prediction.status}</p>
        </div>
      )}
    </div>
  );
}