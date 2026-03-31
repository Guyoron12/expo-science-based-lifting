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
          muscleGroups: [
            {
              id: 1,
              name: "Chest",
              activation: "primary",
            },
            {
              id: 2,
              name: "Shoulders",
              activation: "secondary",
            },
            {
              id: 3,
              name: "Triceps",
              activation: "stabilizer",
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
