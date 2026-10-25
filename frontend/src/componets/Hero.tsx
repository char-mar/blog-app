import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GalleryImage {
  id: number;
  imageUrl: string;
  title: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    imageUrl: "/image1.jpeg",
    title: "Mountain Escape",
  },
  {
    id: 2,
    imageUrl: "/image2.jpg",
    title: "Hidden Paradise",
  },
  {
    id: 3,
    imageUrl: "/image1.jpeg",
    title: "Machu Picchu",
  },
  {
    id: 4,
    imageUrl: "/image2.jpg",
    title: "Into the Forest",
  },
  {
    id: 5,
    imageUrl: "/image2.jpg",
    title: "Ocean Views",
  },
];

export default function Hero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Find the card closest to the center of the carousel.
  const updateActiveCard = (container: HTMLDivElement) => {
    const cards = container.querySelectorAll<HTMLElement>(
      "[data-gallery-index]",
    );

    const containerCenter =
      container.getBoundingClientRect().left + container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      const index = Number(card.dataset.galleryIndex);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex((current) =>
      current === closestIndex ? current : closestIndex,
    );
  };

  // Scroll left or right using the navigation buttons.
  const scrollGallery = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const activeCard = container.querySelector<HTMLElement>(
      `[data-gallery-index="${activeIndex}"]`,
    );

    if (!activeCard) return;

    const currentLeft = container.scrollLeft;
    const containerCenter =
      container.getBoundingClientRect().left + container.clientWidth / 2;

    const cardCenter =
      activeCard.getBoundingClientRect().left +
      activeCard.getBoundingClientRect().width / 2;

    const distanceToCenter = cardCenter - containerCenter;
    const cardWidth = activeCard.getBoundingClientRect().width;
    const gap = 20;

    const targetLeft =
      currentLeft +
      distanceToCenter +
      (direction === "right" ? cardWidth + gap : -cardWidth - gap);

    container.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#100f0c] px-4 py-16 text-white sm:px-8">
      {/* Academy heading */}
      <div className="mx-auto mb-10 max-w-6xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
          Coil Royal Net Academy
        </p>

        <h1 className="text-3xl font-bold uppercase tracking-wide sm:text-5xl">
          Intensive Training
        </h1>

        <p className="mt-3 text-sm text-white/60 sm:text-base">
          Learn by doing
        </p>
      </div>

      {/* Image carousel */}
      <div className="relative mx-auto max-w-6xl">
        {/* Left button */}
        <button
          type="button"
          onClick={() => scrollGallery("left")}
          aria-label="Previous image"
          className="absolute left-1 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/70 text-2xl transition hover:bg-white hover:text-black sm:left-3"
        >
          ‹
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          onScroll={(event) => updateActiveCard(event.currentTarget)}
          className="flex items-center gap-5 overflow-x-auto overflow-y-hidden px-[calc(50%-72.5px)] py-12 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[calc(50%-100px)]"
        >
          {galleryImages.map((image, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.article
                key={image.id}
                data-gallery-index={index}
                initial={false}
                animate={{
                  scale: isActive ? 1.12 : 0.86,
                  opacity: isActive ? 1 : 0.65,
                  filter: isActive ? "blur(0px)" : "blur(0.5px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  mass: 0.8,
                }}
                style={{
                  zIndex: isActive ? 10 : 1,
                  transformOrigin: "center center",
                }}
                className="group relative h-[240px] w-[145px] shrink-0 snap-center overflow-hidden rounded-xl sm:h-[320px] sm:w-[200px]"
              >
                {/* Image */}
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />

                {/* Image details */}
                <div className="absolute inset-x-0 bottom-0 p-3 text-center sm:p-5">
                  <motion.p
                    animate={{
                      opacity: isActive ? 1 : 0.75,
                      y: isActive ? 0 : 4,
                    }}
                    className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/70 sm:text-xs"
                  >
                    Coil Royal Net Academy
                  </motion.p>

                  <h2 className="text-xs font-bold uppercase tracking-wide sm:text-lg">
                    {image.title}
                  </h2>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Right button */}
        <button
          type="button"
          onClick={() => scrollGallery("right")}
          aria-label="Next image"
          className="absolute right-1 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/70 text-2xl transition hover:bg-white hover:text-black sm:right-3"
        >
          ›
        </button>
      </div>
    </section>
  );
}
