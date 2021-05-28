import { Button , InputAdornment, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccelerometerData, selectMagnetometerData } from '../features/microbit/microbitSlice';
import axios from 'axios';
import cfg from '../config.json';



export default function Respiration() {
    const accelerometerData = useSelector(selectAccelerometerData);
    const magnetometerData = useSelector(selectMagnetometerData);

    const dispatch = useDispatch();


    const [exhaleCount, setExhaleCount] = useState(0);
    const [inhaleCount, setInhaleCount] = useState(0);
    const [diffMinMax, setDiffMinMax] = useState<number>(0);
    const [minBreathMagnitude, setMinBreathMagnitude] = useState(0);
    const [maxBreathMagnitude, setMaxBreathMagnitude] = useState(0);
    const [breathMagnitude, setBreathMagnitude] = useState(0);
    const [hasBreathed, setHasBreathed] = useState(false);

    
    console.log(`${cfg.server_url}/save_to_db`)
    useEffect(() => {
        setTimeout(function () {
            axios.post(`${cfg.server_url}/save_to_db`, { "gesture_name": 'breath_rate', "fields": { "magnetometerX": magnetometerData.x, "magnetometerY": magnetometerData.y, "magnetometerZ": magnetometerData.z } }).then((res) => {
                return (res.data['weightsManifest']);
            }).catch((err) => { return err; });
        }, 1000);
        let media = document.getElementById('mediaPlayer')
        if (magnetometerData.x > 0) {
            // @ts-ignore
            media.playbackRate = 1.0
        } else {
            // @ts-ignore
            media.playbackRate = 0.5
        }
        console.log(magnetometerData)
    }, [magnetometerData])


    function absolute(value: number) {
        return Math.sqrt(value * value);
    }


    const checkBreathLevel = () => {
        setTimeout(() => {
            let breathRate = exhaleCount;
        
            let media = document.getElementById('mediaPlayer')

            if (breathRate > 5) {
                // @ts-ignore
                media.playbackRate = 1.8

            } else {

                // @ts-ignore
                media.playbackRate = 1.0

            }

            checkBreathLevel();
            resetMinMax();

        }, 20000)
    } 



    useEffect(() => {
        checkBreathLevel();
    }, [])

    useEffect(() => {
        let mag = accelerometerData.x + accelerometerData.y + accelerometerData.z;
        setDiffMinMax(absolute((maxBreathMagnitude - minBreathMagnitude) * 0.75));
        let hasExhaled = absolute(minBreathMagnitude - breathMagnitude) >= diffMinMax;
        let hasInhaled = absolute(maxBreathMagnitude - breathMagnitude) >= diffMinMax;
        if ((hasExhaled || hasInhaled) && !hasBreathed) {
            if (hasExhaled) {
                setExhaleCount(exhaleCount + 1);
            }
            if (hasInhaled) {
                setInhaleCount(inhaleCount + 1);
            }
            setHasBreathed(true);
            
            setTimeout(() => {
                console.log("Breath Magnitude: " + breathMagnitude);
                console.log("Min Breath Magnitude: " + minBreathMagnitude);
                console.log("Threshold Magnitude: " + diffMinMax);
                setHasBreathed(false);
            }, 1500);
        }
        if (mag < minBreathMagnitude - 200) {
            setMinBreathMagnitude(mag);
        }
        if (mag > maxBreathMagnitude + 200) {
            setMaxBreathMagnitude(mag);
        }
        setBreathMagnitude(mag);
    }, [accelerometerData, breathMagnitude, diffMinMax, dispatch, hasBreathed, inhaleCount, maxBreathMagnitude, minBreathMagnitude]);



    function resetMinMax() {
        setMinBreathMagnitude(0);
        setMaxBreathMagnitude(0);
        setInhaleCount(0);
        setExhaleCount(0);
    }


    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => resetMinMax()}>Reset</Button>

            <h1>Music</h1>
            <audio id="mediaPlayer" src="https://ia802707.us.archive.org/25/items/win3.0midi/ALMONDS.ogg" controls loop />
            <br />
             
            <h3>Breath Count</h3>
            <h3>{exhaleCount}</h3>

            <h3>Magnetometer</h3>
            <h3>X: {magnetometerData.x} Y: {magnetometerData.y} Z:{magnetometerData.z}</h3>

            <h3>Accelerometer</h3>
            <h3>X: {accelerometerData.x} Y: {accelerometerData.y} Z: {accelerometerData.z}</h3> 

            <h3>Acceleration Magnitude</h3>
            <h3>{breathMagnitude}</h3>

        </div>
    );
}


