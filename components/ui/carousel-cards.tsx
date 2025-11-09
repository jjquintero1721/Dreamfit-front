"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, Calculator, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
  buttonText: string;
  onClick: () => void;
}

interface CarouselCardsProps {
  cards: CardData[];
}

export const CarouselCards: React.FC<CarouselCardsProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDotClick = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getCardPosition = (index: number) => {
    const diff = (index - currentIndex + cards.length) % cards.length;

    if (diff === 0) return 'center';
    if (diff === 1 || diff === cards.length - 1) return diff === 1 ? 'right' : 'left';
    return 'hidden';
  };

  const getCardStyles = (position: string) => {
    switch (position) {
      case 'center':
        return {
          x: 0,
          scale: 1,
          rotateY: 0,
          zIndex: 30,
          filter: 'blur(0px)',
          opacity: 1,
        };
      case 'left':
        return {
          x: '-60%',
          scale: 0.75,
          rotateY: 25,
          zIndex: 20,
          filter: 'blur(2px)',
          opacity: 0.7,
        };
      case 'right':
        return {
          x: '60%',
          scale: 0.75,
          rotateY: -25,
          zIndex: 20,
          filter: 'blur(2px)',
          opacity: 0.7,
        };
      default:
        return {
          x: 0,
          scale: 0.5,
          rotateY: 0,
          zIndex: 10,
          filter: 'blur(5px)',
          opacity: 0,
        };
    }
  };

  const MobileCard = ({ card }: { card: CardData }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
      onClick={card.onClick}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${card.imageUrl}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-6">
        <div>
          <h3 className="flex items-center gap-2 text-white text-xl font-bold mb-2">
            {card.icon}
            {card.title}
          </h3>
          <p className="text-white/90 text-sm">
            {card.description}
          </p>
        </div>

        <Button
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white"
          onClick={(e) => {
            e.stopPropagation();
            card.onClick();
          }}
        >
          {card.buttonText}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Layout - Visible only on screens smaller than md (768px) */}
      <div className="block md:hidden w-full px-4 py-6">
        <div className="space-y-4">
          {cards.map((card) => (
            <MobileCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Desktop Carousel - Hidden on mobile, visible on md and larger */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-4 py-8">
        {/* Carousel Container */}
        <div className="relative h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden">

          {/* Cards */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
            <AnimatePresence mode="sync">
              {cards.map((card, index) => {
                const position = getCardPosition(index);
                const styles = getCardStyles(position);

                return (
                  <motion.div
                    key={card.id}
                    className="absolute w-[50%] lg:w-[40%] h-[320px] cursor-pointer"
                    initial={styles}
                    animate={styles}
                    transition={{
                      duration: 0.5,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    onClick={() => {
                      if (position === 'center') {
                        card.onClick();
                      } else if (position === 'left') {
                        handlePrevious();
                      } else if (position === 'right') {
                        handleNext();
                      }
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center center',
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${card.imageUrl}')`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/50" />
                      </div>

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-6">
                        <div>
                          <h3 className="flex items-center gap-2 text-white text-xl md:text-2xl font-bold mb-2">
                            {card.icon}
                            {card.title}
                          </h3>
                          <p className="text-white/90 text-sm md:text-base">
                            {card.description}
                          </p>
                        </div>

                        <Button
                          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (position === 'center') {
                              card.onClick();
                            }
                          }}
                        >
                          {card.buttonText}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 md:left-8 z-40 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 text-white rounded-full p-2 md:p-3 transition-all duration-200 shadow-lg"
            disabled={isAnimating}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 md:right-8 z-40 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 text-white rounded-full p-2 md:p-3 transition-all duration-200 shadow-lg"
            disabled={isAnimating}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex 
                  ? 'w-8 h-2 bg-primary' 
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </>
  );
};