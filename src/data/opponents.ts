import { Intention } from '../types/game';

export const OPPONENTS: Array<{
  name: string;
  maxFace: number;
  intentions: Intention[];
}> = [
    {
      name: "The Gilded Concubine",
      maxFace: 40,
      intentions: [
        { name: "Seductive Wit", type: "favor", value: 15 },
        { name: "Hidden Jab", type: "attack", value: 10 }
      ]
    },
    {
      name: "The Iron General",
      maxFace: 80,
      intentions: [
        { name: "Heavy Rebuke", type: "attack", value: 20 },
        { name: "Imperial Order", type: "stall", value: 5 }
      ]
    }
  ];