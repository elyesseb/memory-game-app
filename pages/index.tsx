import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import _ from "lodash";
import { useState, useCallback, useMemo, useEffect } from "react";
import Confetti from "react-confetti";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

type Card = {
  id: number;
  label: string;
  url: string;
  isHidden: boolean;
};

type Props = {
  shuffledData: Card[];
};

let intervalId: any;

export default function Home({ shuffledData }: Props) {
  const [cards, setCards] = useState<Card[]>(
    shuffledData.map((card) => ({ ...card, isHidden: true }))
  );
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const startGame = () => {
    setIsGameStarted(true);
    setStartTime(Date.now());
    intervalId = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);
  };

  const stopTimer = useCallback(() => {
    clearInterval(intervalId);
  }, []);

  // Victoire du jeu
  useEffect(() => {
    if (
      cards &&
      cards.every((card) => !card.isHidden) &&
      startTime &&
      !isGameOver
    ) {
      setIsGameOver(true);
      stopTimer();
    }
  }, [cards, startTime, isGameOver, stopTimer]);

  const flipCardsBack = useCallback(
    (id: number) => {
      // Met à jour l'état des cartes pour que les cartes sélectionnées soient à nouveau cachées
      setCards((prevCards) =>
        prevCards.map((c) =>
          // Si l'id de la carte correspond à l'une des cartes sélectionnées, mettre son état à caché
          c.id === selectedCards[0].id || c.id === id
            ? { ...c, isHidden: true }
            : c
        )
      );
      // Réinitialise les cartes sélectionnées
      setSelectedCards([]);
      // Réinitialise l'état de comparaison
      setIsComparing(false);
    },
    [selectedCards]
  );

  const handleCardClick = useCallback(
    (id: number) => {
      // Trouve la carte correspondant à l'id cliqué
      const card = cards.find((c) => c.id === id);
      // Si la carte n'existe pas ou si une comparaison est en cours ou si la carte est déjà retournée, quitte la fonction
      if (!card || isComparing || !card.isHidden) {
        return;
      }
      // Met à jour les cartes pour afficher la carte cliquée
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === id ? { ...c, isHidden: false } : c))
      );
      // Ajoute la carte cliquée à la liste des cartes sélectionnées
      setSelectedCards((prevSelectedCards) =>
        prevSelectedCards.concat({ ...card, isHidden: false })
      );
      // Si une carte a déjà été sélectionnée
      if (selectedCards.length === 1) {
        setIsComparing(true);
        // Si les cartes sélectionnées n'ont pas le même label
        if (selectedCards[0].label !== card.label) {
          // Retourne les cartes après 1 seconde
          setTimeout(() => {
            flipCardsBack(id);
          }, 1000);
        } else {
          // Les deux cartes sélectionnées sont des paires
          setSelectedCards([]); // Réinitialisation de la liste des cartes sélectionnées
          setIsComparing(false); // Réinitialisation de l'état de comparaison
        }
      }
    },
    [cards, flipCardsBack, isComparing, selectedCards]
  );

  const resetGame = () => {
    // Retourner toute les cartes
    setCards((prevCards) =>
      prevCards.map((card) => {
        return { ...card, isHidden: !card.isHidden };
      })
    );
    setTimeout(() => {
      // Mélanger toute les cartes
      setCards(
        _.shuffle(shuffledData.map((card) => ({ ...card, isHidden: true })))
      );
      setSelectedCards([]);
      setIsComparing(false);
      setIsGameOver(false);
      setStartTime(null);
      setElapsedTime(0);
    }, 600);
  };

  const cardComponent = useMemo(
    () =>
      cards.map(({ id, label, url, isHidden }) => {
        return (
          <div
            key={id}
            onClick={() => isGameStarted && !isComparing && handleCardClick(id)}
            className={`${styles.card} ${isHidden ? styles.flipped : ""}`}
          >
            <div className={styles.card_front}>
              <Image
                src={"https://cdn-icons-png.flaticon.com/512/6662/6662900.png"}
                alt={"card"}
                width="0"
                height="0"
                sizes="100vw"
                className={styles.card_img}
              />
            </div>
            <div className={styles.card_back}>
              <Image
                src={url}
                alt={label}
                width="0"
                height="0"
                sizes="100vw"
                className={styles.card_img}
              />
            </div>
          </div>
        );
      }),
    [cards, handleCardClick, isComparing, isGameStarted]
  );

  return (
    <>
      <Head>
        <title>Memory Game App</title>
        <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/7283/7283055.png" />
      </Head>
      <nav className={styles.nav}>
        <button
          className={styles.btn_reset}
          onClick={resetGame}
          disabled={!isGameOver}
        >
          {"Reset"}
          <FontAwesomeIcon
            className={styles.icon}
            icon={faRefresh}
            aria-hidden="true"
          />
        </button>
        <button
          className={styles.btn_reset}
          onClick={startGame}
          disabled={!!startTime}
        >
          Start Game
        </button>
        <div className={styles.time}>Time : {elapsedTime} sec</div>
      </nav>
      <main className={styles.main}>
        {isGameOver && <Confetti />}
        <div className={styles.card_container}>{cardComponent}</div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const url = "http://localhost:3000/api/images";
  const res = await fetch(url);
  const data: Card[] = await res.json();
  const shuffledData = _.shuffle(data);

  return {
    props: {
      shuffledData,
    },
  };
};
