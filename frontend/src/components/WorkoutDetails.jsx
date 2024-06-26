import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'



const WorkoutDetails = ({workout}) => {
    const { dispatch } = useWorkoutsContext();

    const [isError, setIsError] = useState('');
    const [editedWorkout, setEditedWorkout] = useState({ ...workout });
    const MySwal = withReactContent(Swal);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedWorkout((prevWorkout) => ({
          ...prevWorkout,
          [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if(!(editedWorkout.title && editedWorkout.load && editedWorkout.reps)){
            setIsError('All fields required')
            return
        }
        
        try {
            const response = await fetch(`http://localhost:4000/api/workouts/${workout._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedWorkout),
            });
            const data = await response.json();
            if (!response.ok) {
                console.log(data.error);
            }
            if (response.ok) {
                dispatch({ type: 'EDIT_WORKOUT', payload: editedWorkout });
                const modalCloseBtn = document.getElementById(`closeBtn-${workout._id}`);
                if (modalCloseBtn) {
                    modalCloseBtn.click();
                }

                MySwal.fire({
                    icon: "success",
                    title: "Updated!",
                    text:'Workout has been Updated.',
                    showConfirmButton: false,
                    timer: 2000
                });

            }
            setIsError('')
        } catch (err) {
            console.log(err);
        }
    };


    const handleDelete = () => {

        MySwal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this record!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor:'#1aac83',
            cancelButtonColor: "#d33",
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {

                const deleteWorkout = async () => {
                    const response = await fetch('http://localhost:4000/api/workouts/'+ workout._id, {
                        method: 'DELETE',
                    })
                    const data = await response.json();
                    if (!response.ok) {
                         MySwal.fire(
                            'Cancelled',
                            data.error,
                            'error'
                        ); 
                    }
            
                    if (response.ok) {
                        MySwal.fire({
                            icon: "success",
                            title: "Deleted!",
                            text:'Workout has been deleted.',
                            showConfirmButton: false,
                            timer: 2000
                        });
                        dispatch({type: 'DELETE_WORKOUT', payload: data })
                    }
                }
                deleteWorkout();
            }
        });
    }

    return (
        <>
            <div className="workout-details">
                <h4>{workout.title}</h4>
                <p>Reps: <strong>{workout.reps}</strong></p>
                <p>Loads(in Kg): {workout.load}</p>
                <p>{formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}</p>
                <button className="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target={`#Modal-${workout._id}`}>Edit</button>
                <span onClick={handleDelete} className="btn btn-sm btn-danger"><i className="bi bi-trash"></i></span>
            </div>

            <div className="modal fade" id={`Modal-${workout._id}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <form onSubmit={handleUpdate}>

                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Workout</h5>
                            </div>

                            <div className="modal-body">
                                <label>Exercise Title:</label>
                                <input type="text" name="title" value={editedWorkout.title} onChange={handleInputChange} />

                                <label>Number of Reps:</label>
                                <input type="number" name="reps" value={editedWorkout.reps} onChange={handleInputChange} />

                                <label>Load (in kg):</label>
                                <input type="number" name="load" value={editedWorkout.load} onChange={handleInputChange} />

                                {isError && <p className="error">{isError}</p>}
                                
                            </div>
                            
                            <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Save Changes</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" id={`closeBtn-${workout._id}`}>Close</button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}

export default WorkoutDetails;