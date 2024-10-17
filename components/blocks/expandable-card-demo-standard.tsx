"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function ExpandableCardDemoStandard() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col md:flex-row ">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <Image
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.title}-${id}`}
              className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
            >
              {card.ctaText}
            </motion.button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const cards = [
  {
    description: "Radiohead",
    title: "Creep",
    src: "data:image/webp;base64,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", // Radiohead inspired image
    ctaText: "Join",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <>
          Radiohead, an English rock band formed in 1985, is known for their
          experimental sound that transcends traditional rock genres. Led by
          vocalist Thom Yorke, Radiohead has earned critical acclaim for their
          willingness to push musical boundaries.
          <br />
          <br />
          Their music often explores complex themes such as alienation,
          technology, and politics, making them a defining voice in alternative
          rock. Their groundbreaking album *OK Computer* is considered one of
          the greatest albums of all time.
        </>
      );
    },
  },
  {
    description: "Daft Punk",
    title: "One More Time",
    src: "data:image/webp;base64,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", // Daft Punk inspired image
    ctaText: "Join",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <>
          Daft Punk, the iconic French electronic music duo, are pioneers in the
          house and electronic music scene. Their unique blend of house beats,
          funk, and disco has made them one of the most influential acts in
          electronic music history.
          <br />
          <br />
          Known for their robot personas and innovative production techniques,
          Daft Punk's music has earned numerous accolades, with hits like *Get
          Lucky* and *Around the World* cementing their legacy in modern music.
        </>
      );
    },
  },
  {
    description: "Nirvana",
    title: "Smells Like Teen Spirit",
    src: "data:image/webp;base64,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", // Nirvana inspired image
    ctaText: "Join",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <>
          Nirvana, the band that defined the grunge movement of the 1990s, is
          synonymous with alternative rock's raw, emotional edge. Led by Kurt
          Cobain, their music spoke to a generation's angst and disillusionment.
          <br />
          <br />
          Nirvana's breakout hit *Smells Like Teen Spirit* brought grunge into
          the mainstream, and their album *Nevermind* is widely regarded as one
          of the greatest rock albums ever.
        </>
      );
    },
  },
  {
    description: "The Beatles",
    title: "Hey Jude",
    src: "data:image/webp;base64,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", // Beatles inspired image
    ctaText: "Join",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <>
          The Beatles, perhaps the most famous and influential band in history,
          changed the face of modern music. John Lennon, Paul McCartney, George
          Harrison, and Ringo Starr defined the 1960s with their innovative
          songwriting and genre-spanning albums.
          <br />
          <br />
          From early hits like *Love Me Do* to later masterpieces like *Abbey
          Road*, The Beatles' legacy in rock and pop music is unmatched, and
          they continue to influence musicians across the globe.
        </>
      );
    },
  },
];