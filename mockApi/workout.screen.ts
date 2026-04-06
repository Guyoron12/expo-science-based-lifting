//TODO: mock split data
// after user logged in, user should have active split which will be fetched here
// currently we are using mock data still representing the backend data structure
const split = {
  id: 1,
  name: "upper lower",
  frequencyWeekly: 2,
  active: true,
  routines: [
    {
      id: 1,
      name: "upper A",
      exercises: [
        {
          id: 1,
          exerciseName: "Bench Press",
          image:
            "https://www.shutterstock.com/image-vector/bench-press-icon-glyphstyle-gym-260nw-1440715121.jpg",
          muscleGroups: [
            {
              id: 1,
              name: "Chest",
              activation: {
                label: "primary",
                value: 1,
              },
            },
            {
              id: 2,
              name: "Shoulders",
              activation: {
                label: "secondary",
                value: 0.5,
              },
            },
            {
              id: 3,
              name: "Triceps",
              activation: {
                label: "secondary",
                value: 0.5,
              },
            },
          ],
        },
        {
          id: 2,
          exerciseName: "Wide grip pull-ups",
          image:
            "https://cdn.vectorstock.com/i/1000v/30/32/pull-up-icon-vector-33743032.jpg",
          muscleGroups: [
            {
              id: 1,
              name: "Lats",
              activation: {
                label: "primary",
                value: 1,
              },
            },
            {
              id: 2,
              name: "Rhomboids",
              activation: {
                label: "secondary",
                value: 0.75,
              },
            },
            {
              id: 3,
              name: "Biceps",
              activation: {
                label: "secondary",
                value: 0.6,
              },
            },
            {
              id: 4,
              name: "Forearms",
              activation: {
                label: "stabilizer",
                value: 0.2,
              },
            },
          ],
        },
      ],
    },
  ],
};
export default function fetchActiveSplit() {
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(split);
    }, 300);
  });
}
