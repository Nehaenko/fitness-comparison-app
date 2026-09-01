export default function RoutineNewPage() {
    return (
        <>
            <h1>New Routine</h1>
            <p>NUMBER workouts</p>
            <p>BACK BUTTON</p>

            <div>
                <label htmlFor="routineName">
                    <span>Routine Name</span>
                    <input type="text" placeholder="New Routine" id="routineName" />
                </label>

                <label htmlFor="routineDescription">
                    <span>Description</span>
                    <input type="text" placeholder="Describe your routine" id="routineDescription" />
                </label>
            </div>

            <button>
                + Add Workout
            </button>
        </>
    )
}