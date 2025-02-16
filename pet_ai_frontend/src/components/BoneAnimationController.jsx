import * as THREE from 'three';

class BoneAnimationController {
  constructor(bones, mixer) {
    this.bones = bones;
    this.mixer = mixer;
    this.currentAnimations = new Map();
    
    // Define bone groups based on your FBX model structure
    this.boneGroups = {
      tail: ['Tail_01', 'Tail_02', 'Tail_03', 'Tail_04', 'Tail_05'],
      leftFrontPaw: ['FrontPawL_01', 'FrontPawL_02', 'FrontPawL_03', 'FrontPawL_04', 'FrontPawL_05'],
      rightFrontPaw: ['FrontPawR_01', 'FrontPawR_02', 'FrontPawR_03', 'FrontPawR_04', 'FrontPawR_05'],
      leftBackPaw: ['BackPawL_01', 'BackPawL_02', 'BackPawL_03', 'BackPawL_04', 'BackPawL_05'],
      rightBackPaw: ['BackPawR_01', 'BackPawR_02', 'BackPawR_03', 'BackPawR_04', 'BackPawR_05'],
      spine: ['Spine_01', 'Spine_02', 'Spine_03', 'Spine_04'],
      neck: ['Neck'],
      head: ['Head'],
      leftEar: ['EarL_01', 'EarL_02'],
      rightEar: ['EarR_01', 'EarR_02'],
      eyes: ['Eye_L', 'Eye_R', 'Eyelid_L', 'Eyelid_R'],
      mouth: ['Mouth'],
      whiskers: ['Whiskers_L', 'Whiskers_R']
    };

    // Log initial rotations of bones
    
    // Store initial rotations
    this.initialRotations = {};
    this.initialPositions = {};
    Object.entries(this.bones).forEach(([boneName, bone]) => {
        console.log(`${boneName} initial rotation:`, {
            x: bone.rotation.x,
            y: bone.rotation.y,
            z: bone.rotation.z
          },`${boneName} initial position:`, {
            x: bone.position.x,
            y: bone.position.y,
            z: bone.position.z
          });
      this.initialRotations[boneName] = new THREE.Euler(
        bone.rotation.x,
        bone.rotation.y,
        bone.rotation.z
      );
      this.initialPositions[boneName] = new THREE.Vector3(
        bone.position.x,
        bone.position.y,
        bone.position.z
      );
    });

    // Predefined action templates
    this.actionTemplates = {
        walk:{
            boneGroups: ['leftBackPaw', 'rightBackPaw', 'spine', 'rightFrontPaw', 'leftFrontPaw', 'tail'],
            positions: {
                spine: {
                    'Spine_04': [
                        {
                            time: 0,
                            position: this.getInitialPosition('Spine_04'),
                            rotation: this.getInitialRotation('Spine_04')
                        },
                        {
                            time: 0.75,
                            position: new THREE.Vector3(
                                this.getInitialPosition('Spine_04').x,
                                this.getInitialPosition('Spine_04').y, // Reduced body bounce
                                this.getInitialPosition('Spine_04').z
                            ),
                            rotation: new THREE.Euler(
                                this.getInitialRotation('Spine_04').x - Math.PI * 0.01, // Reduced rotation
                                this.getInitialRotation('Spine_04').y,
                                this.getInitialRotation('Spine_04').z
                            )
                        },
                        {
                            time: 1.5,
                            position: this.getInitialPosition('Spine_04'),
                            rotation: this.getInitialRotation('Spine_04')
                        },
                    ]
                },
                tail: {
                    'Tail_01': [
                        {
                            time: 0,
                            position: this.getInitialPosition('Tail_01'),
                            rotation: this.getInitialRotation('Tail_01')
                        },
                        {
                            time: 0.75,
                            position: new THREE.Vector3(
                                this.getInitialPosition('Tail_01').x,
                                this.getInitialPosition('Tail_01').y,
                                this.getInitialPosition('Tail_01').z + 0.03 // Reduced tail movement
                            ),
                            rotation: new THREE.Euler(
                                this.getInitialRotation('Tail_01').x + Math.PI * 0.05, // Reduced tail rotation
                                this.getInitialRotation('Tail_01').y,
                                this.getInitialRotation('Tail_01').z
                            )
                        },
                        {
                            time: 1.5,
                            position: this.getInitialPosition('Tail_01'),
                            rotation: this.getInitialRotation('Tail_01')
                        }
                    ]
                },
                rightFrontPaw: {
                    'FrontPawR_01': [
                        {
                            time: 0,
                            position: new THREE.Vector3(
                                this.getInitialPosition('FrontPawR_01').x,
                                this.getInitialPosition('FrontPawR_01').y + 0.03, // Slight moving up
                                this.getInitialPosition('FrontPawR_01').z 
                            ),
                        },
                        {
                            time: 0.5,
                            position: this.getInitialPosition('FrontPawR_01')
                        },
                        {
                            time: 1,
                            position: new THREE.Vector3(
                                this.getInitialPosition('FrontPawR_01').x,
                                this.getInitialPosition('FrontPawR_01').y + 0.03, // Slight moving up
                                this.getInitialPosition('FrontPawR_01').z 
                            )
                        },
                    ]
                },
                leftFrontPaw: {
                    'FrontPawL_01': [
                        {
                            time: 0,
                            position: this.getInitialPosition('FrontPawL_01')
                        },
                        {
                            time: 0.5,
                            position: new THREE.Vector3(
                                this.getInitialPosition('FrontPawL_01').x,
                                this.getInitialPosition('FrontPawL_01').y + 0.03, // Slight moving up
                                this.getInitialPosition('FrontPawL_01').z 
                            )
                        },
                        {
                            time: 1,
                            position: this.getInitialPosition('FrontPawL_01')
                        },
                    ]
                },
                leftBackPaw: {
                    'BackPawL_01': [
                        {
                            time: 0,
                            rotation: new THREE.Euler(
                                this.getInitialRotation('BackPawL_01').x - Math.PI * 0.05, // Reduced angle
                                this.getInitialRotation('BackPawL_01').y,
                                this.getInitialRotation('BackPawL_01').z
                            )
                        },
                        {
                            time: 0.5,
                            rotation: this.getInitialRotation('BackPawL_01')
                        },
                        {
                            time: 1,
                            rotation: new THREE.Euler(
                                this.getInitialRotation('BackPawL_01').x - Math.PI * 0.05, // Reduced angle
                                this.getInitialRotation('BackPawL_01').y,
                                this.getInitialRotation('BackPawL_01').z
                            )
                        },
                    ],
                },
                rightBackPaw: {
                    'BackPawR_01': [
                        {
                            time: 0,
                            rotation: this.getInitialRotation('BackPawR_01')
                        },
                        {
                            time: 0.5,
                            rotation: new THREE.Euler(
                                this.getInitialRotation('BackPawR_01').x - Math.PI * 0.05, // Reduced angle
                                this.getInitialRotation('BackPawR_01').y,
                                this.getInitialRotation('BackPawR_01').z
                            )
                        },
                        {
                            time: 1,
                            rotation: this.getInitialRotation('BackPawR_01')
                        },
                    ],
                },
                duration: 1.5,
                loop: true,
            },
        },
        sit: {
            positions: {
            rightFrontPaw: {
                'FrontPawR_01':[
                { //前腿腿跟 x
                    time: 0,
                    position: new THREE.Vector3(
                        this.getInitialPosition('FrontPawR_01').x ,
                        this.getInitialPosition('FrontPawR_01').y,
                        this.getInitialPosition('FrontPawR_01').z
                    ),
                },
                {
                    time: 0.5,
                    position: new THREE.Vector3(
                        this.getInitialPosition('FrontPawR_01').x ,
                        this.getInitialPosition('FrontPawR_01').y,
                        this.getInitialPosition('FrontPawR_01').z - 0.14
                    ),
                }
                ],
            },
            leftFrontPaw:{
                'FrontPawL_01':[
                { //前腿腿跟 x
                    time: 0,
                    position: new THREE.Vector3(
                        this.getInitialPosition('FrontPawL_01').x ,
                        this.getInitialPosition('FrontPawL_01').y,
                        this.getInitialPosition('FrontPawL_01').z
                    ),
                },
                {
                    time: 0.5,
                    position: new THREE.Vector3(
                        this.getInitialPosition('FrontPawL_01').x ,
                        this.getInitialPosition('FrontPawL_01').y,
                        this.getInitialPosition('FrontPawL_01').z - 0.14
                    ),
                }
                ],
            },
            leftBackPaw: {
                'BackPawL_01':[ //脊椎尾端 0.1 means 伸直
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawL_01')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawL_01').x + Math.PI * 0.1,
                        this.getInitialRotation('BackPawL_01').y,
                        this.getInitialRotation('BackPawL_01').z
                        )
                    }
                ], 
                'BackPawL_02':[ // 大腿根往外張開
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawL_02')
                    },
                ],
                'BackPawL_03':[ // 大腿根 0.3 means 伸直
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawL_03')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawL_03').x + Math.PI * 0.1,
                        this.getInitialRotation('BackPawL_03').y,
                        this.getInitialRotation('BackPawL_03').z
                        )
                    }
                ],
                'BackPawL_04':[ // 膝蓋 0.5 means bent 90 degrees
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawL_04')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawL_04').x + Math.PI * 0.5,
                        this.getInitialRotation('BackPawL_04').y,
                        this.getInitialRotation('BackPawL_04').z
                        )
                    }
                ],
                'BackPawL_05':[ // 腳掌
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawL_05')
                    }
                ]
                },
            rightBackPaw: {
                'BackPawR_01':[ //脊椎尾端 0.1 means 伸直
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawR_01')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawR_01').x + Math.PI * 0.1,
                        this.getInitialRotation('BackPawR_01').y,
                        this.getInitialRotation('BackPawR_01').z
                        )
                    }
                ], 
                'BackPawR_02':[ // 大腿根往外張開
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawR_02')
                    },
                ],
                'BackPawR_03':[ // 大腿根 0.3 means 伸直
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawR_03')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawR_03').x + Math.PI * 0.1,
                        this.getInitialRotation('BackPawR_03').y,
                        this.getInitialRotation('BackPawR_03').z
                        )
                    }
                ],
                'BackPawR_04':[ // 膝蓋 0.5 means bent 90 degrees
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawR_04')
                    },
                    { 
                        time: 0.5, 
                        rotation: new THREE.Euler(
                        this.getInitialRotation('BackPawR_04').x + Math.PI * 0.5,
                        this.getInitialRotation('BackPawR_04').y,
                        this.getInitialRotation('BackPawR_04').z
                        )
                    }
                ],
                'BackPawR_05':[ // 腳掌
                    { 
                        time: 0, 
                        rotation: this.getInitialRotation('BackPawR_05')
                    }
                ]
            },
            spine: {
                'Spine_02': 
                    [ // Mid-spine - bend back
                        {
                            time: 0,
                            position: this.getInitialPosition('Spine_02'),
                            rotation: this.getInitialRotation('Spine_02')
                        },
                        {
                            time: 0.5,
                            position: new THREE.Vector3(
                                this.getInitialPosition('Spine_02').x ,
                                this.getInitialPosition('Spine_02').y,
                                this.getInitialPosition('Spine_02').z - 0.1 // 將上半身相對腹部稱向地面
                            ),
                            rotation: new THREE.Euler(
                                this.getInitialRotation('Spine_02').x - Math.PI * 0.2,
                                this.getInitialRotation('Spine_02').y,
                                this.getInitialRotation('Spine_02').z
                            )
                        }
                    ],
                    // 'Spine_03': [ // Lower spine - adjust position, attaching to the front legs but doesn't really do anything
                    // ],
                    'Spine_04': [ //尾椎  - Math.PI * 0.05 means 伸直
                    {
                        time: 0,
                        position: this.getInitialPosition('Spine_04'),
                        rotation: this.getInitialRotation('Spine_04')
                    },
                    {
                        time: 0.5,
                        position: new THREE.Vector3(
                            this.getInitialPosition('Spine_04').x,
                            this.getInitialPosition('Spine_04').y - 0.13, // 將腹部貼向地面
                            this.getInitialPosition('Spine_04').z
                        ),
                        rotation: new THREE.Euler(
                        this.getInitialRotation('Spine_04').x + Math.PI * 0.02,
                        this.getInitialRotation('Spine_04').y,
                        this.getInitialRotation('Spine_04').z 
                        )
                    }
                    ]
                },
            tail: {
                'Tail_01': [ 
                    {
                        time: 0,
                        position: this.getInitialPosition('Tail_01'),
                        rotation: this.getInitialRotation('Tail_01')
                    },
                    {
                        time: 0.5,
                        position: new THREE.Vector3(
                            this.getInitialPosition('Tail_01').x,
                            this.getInitialPosition('Tail_01').y - 0.12, // moving the root of tail downwards with the hips
                            this.getInitialPosition('Tail_01').z
                        ),
                        rotation: new THREE.Euler(
                        this.getInitialRotation('Tail_01').x,
                        this.getInitialRotation('Tail_01').y,
                        this.getInitialRotation('Tail_01').z 
                        )
                    }
                ]
                },
                duration: 1,
                loop: false
            }
        }
    };
  }

  getInitialRotation(boneName) {
    if (this.initialRotations[boneName]) {
      return this.initialRotations[boneName].clone();
    }
    console.warn(`No initial rotation found for bone: ${boneName}`);
    return new THREE.Euler(0, 0, 0);
  }

  getInitialPosition(boneName) {
    if (this.initialPositions[boneName]) {
      return this.initialPositions[boneName].clone();
    }
    console.warn(`No initial position found for bone: ${boneName}`);
    return new THREE.Euler(0, 0, 0);
  }

  async parseCommand(command) {
    try {
      const commandLower = command.toLowerCase();
      
      if (commandLower.includes('坐') || commandLower.includes('sit')) {
        const sitTemplate = {...this.actionTemplates.sit};
        
        for (let boneGroup in sitTemplate.positions){
            const bonesMovements = sitTemplate.positions[boneGroup];
          for (const boneName in bonesMovements) {
                const bonePositions = bonesMovements[boneName];
                const times = [];
                const positionTimes = [];
                const values = [];
                const positionValues = [];
                for (const idx in bonePositions) {
                    const keyframe = bonePositions[idx];
                    times.push(keyframe.time);
                    
                    if (keyframe.rotation !== undefined){
                        const quaternion = new THREE.Quaternion().setFromEuler(keyframe.rotation);
                        values.push(...quaternion.toArray());
                    }
                    if (keyframe.position !== undefined){
                        positionTimes.push(keyframe.time);
                        positionValues.push(
                            keyframe.position.x,
                            keyframe.position.y,
                            keyframe.position.z
                        );
                    }
                }
                const combinedTracks = [];

                if (times.length !== 0){
                    const track = new THREE.QuaternionKeyframeTrack(
                        `${boneName}.quaternion`,
                        times,
                        values
                    );
                    combinedTracks.push(track);
                }

                if (positionTimes.length !== 0){
                    const positionTrack = new THREE.VectorKeyframeTrack(
                        `${boneName}.position`,
                        positionTimes,
                        positionValues
                    );
                    combinedTracks.push(positionTrack);
                }
                const clip = new THREE.AnimationClip(
                    `${boneName}_sit`,
                    sitTemplate.duration,
                    combinedTracks
                );

                const action = this.mixer.clipAction(clip);
                action.setLoop(sitTemplate.positions.loop ? THREE.LoopRepeat : THREE.LoopOnce);
                action.clampWhenFinished = true;

                // Fade out previous animation for this bone
                if (this.currentAnimations.has(boneName)) {
                    const oldAction = this.currentAnimations.get(boneName);
                    oldAction.fadeOut(0.2);
                }

                // Play the new combined animation
                action.fadeIn(0.2);
                action.play();

                // Store the new animation action
                this.currentAnimations.set(boneName, action);
            }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Command parsing error:', error);
      return false;
    }
  }
}

export default BoneAnimationController;