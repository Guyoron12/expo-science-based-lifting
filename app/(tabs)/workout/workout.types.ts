export type ActiveSplit = {
  id: number;
  name: string;
  frequencyWeekly: number;
  active: boolean;
  routines: Routine[];
};

export type Routine = {
  id: number;
  name: string;
  date?: string;
  status?: string;
  exercises: Exercise[];
};

export type Exercise = {
  id: number;
  exerciseName: string;
  image: string;
  muscleGroups: MuscleGroup[];
  sets: number;
  repRange: {
    min: number;
    max: number;
  };
  rir: {
    min: number;
    max: number;
  };
  lastSession: string;
};

export type MuscleGroup = {
  id: number;
  name: string;
  activation: string;
};
