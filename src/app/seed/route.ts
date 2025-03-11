import { NextRequest, NextResponse } from "next/server";
import prisma from "../lib/prisma";

export async function GET(req: NextRequest) {
    const courses = [
        {
            title: "Antenna Theory",
            description: "Understand antenna design, radiation patterns, and beamforming techniques.",
            icon: 'Antenna',
        },
        {
            title: "Satellite Communications",
            description: "Explore geostationary and low Earth orbit satellites, transponders, and link budget analysis.",
            icon: 'Satellite',
        },
        {
            title: "RF Engineering",
            description: "Learn about RF circuits, impedance matching, and power amplifiers.",
            icon: 'RadioTower',
        },
        {
            title: "5G and Beyond",
            description: "Dive into mmWave, massive MIMO, and next-generation wireless technologies.",
            icon: '5G',
        },
        {
            title: "Network Security",
            description: "Study encryption, firewalls, and intrusion detection systems.",
            icon: 'Shield',
        },
        {
            title: "IoT Networks",
            description: "Understand LPWAN, MQTT, and smart device connectivity.",
            icon: 'Cloud',
        },
        {
            title: "Microwave Communications",
            description: "Learn about microwave transmission, waveguides, and satellite uplinks.",
            icon: 'Waves',
        },
        {
            title: "Edge Computing",
            description: "Explore real-time data processing and decentralized computing architectures.",
            icon: 'CpuChip',
        },
        {
            title: "Wireless Fundamentals",
            description: "Learn about electromagnetic waves, frequency bands, and modulation techniques.",
            icon: 'Wifi',
        },
        {
            title: "Radio Networks",
            description: "Explore cellular networks, radio resource management, and signal propagation.",
            icon: 'Radio',
        },
        {
            title: "Digital Signal Processing",
            description: "Understand sampling, filtering, and digital modulation techniques.",
            icon: 'Cpu',
        },
        {
            title: "Network Protocols",
            description: "Study TCP/IP, routing protocols, and network architecture.",
            icon: 'Network',
        },
        {
            title: "Cloud Infrastructure",
            description: "Learn about virtualization, cloud computing, and distributed systems.",
            icon: 'Server',
        },
        {
            title: "Mobile Communications",
            description: "Explore 4G, 5G technologies, and mobile network architecture.",
            icon: 'Smartphone',
        },
        {
            title: "Optical Networks",
            description: "Study fiber optics, WDM technology, and optical transmission systems.",
            icon: 'Zap',
        },
        {
            title: "Data Networks",
            description: "Learn about data centers, storage networks, and network security.",
            icon: 'Database',
        },
    ];

    const chapters = [
        {
            name: "Wireless Fundamentals",
            icon: 'Wifi',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Radio Networks",
            icon: 'Radio',
            body: `
            <h2>Introduction to Wireless Communications</h2>
            <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
            
            <h3>Electromagnetic Spectrum</h3>
            <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
            
            <h3>Modulation Techniques</h3>
            <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
          `
        },
        {
            name: "Digital Signal Processing",
            icon: 'Cpu',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Network Protocols",
            icon: 'Network',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Cloud Infrastructure",
            icon: 'Server',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Mobile Communications",
            icon: 'Smartphone',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Optical Networks",
            icon: 'Zap',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
        {
            name: "Data Networks",
            icon: 'Database',
            body: `
                  <h2>Introduction to Wireless Communications</h2>
                  <p>Wireless communication is the transfer of information between two or more points that are not connected by an electrical conductor. The most common wireless technologies use radio waves.</p>
                  
                  <h3>Electromagnetic Spectrum</h3>
                  <p>Radio waves are a type of electromagnetic radiation with wavelengths in the electromagnetic spectrum longer than infrared light. Radio waves have frequencies from 300 GHz to as low as 3 kHz.</p>
                  
                  <h3>Modulation Techniques</h3>
                  <p>Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.</p>
                `
        },
    ];
    const chapterQuizzes = [
        {
            id: "wf-q1",
            question: "Which of the following frequency ranges is typically used for Wi-Fi networks?",
            options: ["900 MHz", "2.4 GHz", "10 GHz", "50 GHz"],
            correctAnswer: 1,
            explanation:
                "Wi-Fi networks typically operate in the 2.4 GHz and 5 GHz frequency bands. The 2.4 GHz band is the most commonly used frequency range for Wi-Fi.",
        },
        {
            id: "wf-q2",
            question: "What is modulation in wireless communications?",
            options: [
                "The process of increasing signal power",
                "The process of varying properties of a carrier signal with a modulating signal",
                "The process of filtering unwanted frequencies",
                "The process of converting analog signals to digital",
            ],
            correctAnswer: 1,
            explanation:
                "Modulation is the process of varying one or more properties of a periodic waveform (carrier signal) with a modulating signal that typically contains information to be transmitted.",
        },
        {
            id: "wf-q3",
            question: "Which of the following is NOT a type of wireless signal propagation?",
            options: ["Reflection", "Diffraction", "Scattering", "Amplification"],
            correctAnswer: 3,
            explanation:
                "The three main mechanisms of wireless signal propagation are reflection, diffraction, and scattering. Amplification is a process to increase signal strength, not a propagation mechanism.",
        },
        {
            id: "wf-q4",
            question: "What unit is used to measure frequency?",
            options: ["Watts", "Decibels", "Hertz", "Meters"],
            correctAnswer: 2,
            explanation: "Frequency is measured in Hertz (Hz), which represents the number of cycles per second.",
        },
        {
            id: "wf-q5",
            question: "Which of the following modulation techniques is commonly used in digital communications?",
            options: [
                "Amplitude Modulation (AM)",
                "Frequency Modulation (FM)",
                "Quadrature Amplitude Modulation (QAM)",
                "All of the above",
            ],
            correctAnswer: 3,
            explanation:
                "All of these modulation techniques are used in digital communications. AM and FM are also used in analog communications, while QAM is primarily used in digital systems.",
        },

        {
            id: "rn-q1",
            question: "What is a cell in cellular network terminology?",
            options: [
                "A mobile phone",
                "A geographic area covered by a base station",
                "A type of battery",
                "A network protocol",
            ],
            correctAnswer: 1,
            explanation:
                "In cellular networks, a cell refers to a geographic area covered by a base station (cell tower). The network is divided into these cells to efficiently reuse frequencies.",
        },
        {
            id: "rn-q2",
            question: "What is handover in cellular networks?",
            options: [
                "The process of transferring a call from one cell to another",
                "The process of authenticating a user",
                "The process of encrypting data",
                "The process of billing for services",
            ],
            correctAnswer: 0,
            explanation:
                "Handover (or handoff) is the process of transferring an ongoing call or data session from one cell to another without interruption as a mobile user moves between cells.",
        },
        {
            id: "rn-q3",
            question: "What does MIMO stand for in radio communications?",
            options: [
                "Mobile Input Mobile Output",
                "Multiple Input Multiple Output",
                "Modulated Input Modulated Output",
                "Managed Input Managed Output",
            ],
            correctAnswer: 1,
            explanation:
                "MIMO stands for Multiple Input Multiple Output, which is a method for multiplying the capacity of a radio link using multiple transmission and receiving antennas.",
        },
        {
            id: "rn-q4",
            question: "Which of the following is NOT a cellular network generation?",
            options: ["3G", "4G", "5G", "6H"],
            correctAnswer: 3,
            explanation:
                "3G, 4G, and 5G are all generations of cellular network technology. 6H is not a standard generation designation (the next generation after 5G would be 6G).",
        },
        {
            id: "rn-q5",
            question: "What is the main purpose of Radio Resource Management (RRM)?",
            options: [
                "To manage user billing",
                "To control co-channel interference and optimize radio transmission",
                "To encrypt radio transmissions",
                "To manage user authentication",
            ],
            correctAnswer: 1,
            explanation:
                "Radio Resource Management (RRM) is the system level control of co-channel interference and other radio transmission characteristics in wireless communication systems.",
        },


        {
            id: "default-q1",
            question: "Which of the following is a benefit of digital signal processing?",
            options: ["Lower power consumption", "Immunity to noise", "Flexibility in implementation", "All of the above"],
            correctAnswer: 3,
            explanation:
                "Digital signal processing offers multiple benefits including lower power consumption, better immunity to noise, and flexibility in implementation through software changes.",
        },
        {
            id: "default-q2",
            question: "What is the primary purpose of a network protocol?",
            options: [
                "To encrypt data",
                "To define rules for communication between devices",
                "To increase network speed",
                "To reduce hardware costs",
            ],
            correctAnswer: 1,
            explanation:
                "Network protocols define the rules and conventions for communication between network devices, including message formatting, transmission, reception, and error handling.",
        },
        {
            id: "default-q3",
            question: "Which layer of the OSI model is responsible for routing?",
            options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
            correctAnswer: 2,
            explanation:
                "The Network Layer (Layer 3) of the OSI model is responsible for routing packets between networks, addressing, and path determination.",
        },
    ];
    const simulationData = [
        {
            name: 'Rectangular Signal',
            description: 'Generates a rectangular signal with adjustable width and sampling frequency.',
            params: JSON.stringify({
                x: { name: 'Width', value: 2, unit: 'm', step: 1, min: 1, max: 10 },
                duration: { name: 'Duration', value: 10, unit: 'ms', step: 10, min: 1, max: 1000, convertedToMili: true }
            }),
            endPoint: '/rect'
        },
        {
            name: 'Sinusoidal Signal',
            description: 'Generates a sinusoidal signal with a given period, amplitude, phase, and duration.',
            params: JSON.stringify({
                period: { name: 'Period', value: 5, unit: 'ms', step: 1, min: 1, max: 1000, convertedToMili: true },
                amplitude: { name: 'Amplitude', value: 1.0, unit: 'V', step: 0.1, min: 0.1, max: 10 },
                phase: { name: 'Phase', value: 0.0, unit: 'rad', step: 0.1, min: -Math.PI, max: Math.PI },
                duration: { name: 'Duration', value: 10, unit: 'ms', step: 10, min: 1, max: 1000, convertedToMili: true }
            }),
            endPoint: '/sinus'
        },
        {
            name: 'Impulse Signal',
            description: 'Generates an impulse signal with a single spike at the center of the time window.',
            params: JSON.stringify({
                Te: { name: 'Time Step', value: 1, unit: 'ms', step: 0.1, min: 0.1, max: 10, convertedToMili: true },
                duration: { name: 'Duration', value: 1.0, unit: 's', step: 0.1, min: 0.1, max: 10 }
            }),
            endPoint: '/impulse'
        },
        {
            name: 'Dirac Comb',
            description: 'Generates a Dirac comb signal with impulses at specified intervals.',
            params: JSON.stringify({
                Te: { name: 'Time Step', value: 1, unit: 'ms', step: 0.1, min: 0.1, max: 10, convertedToMili: true },
                duration: { name: 'Duration', value: 1.0, unit: 's', step: 0.1, min: 0.1, max: 10 },
                t_impulse: { name: 'Impulse Interval', value: 100, unit: 'ms', step: 10, min: 10, max: 1000, convertedToMili: true }
            }),
            endPoint: '/dirac_comb'
        },
        {
            name: 'Sampled Sinusoidal Signal',
            description: 'Generates a sinusoidal signal sampled by a Dirac comb.',
            params: JSON.stringify({
                sinus_period: { name: 'Sinus Period', value: 5, unit: 'ms', step: 1, min: 1, max: 1000, convertedToMili: true },
                amplitude: { name: 'Amplitude', value: 1.0, unit: 'V', step: 0.1, min: 0.1, max: 10 },
                phase: { name: 'Phase', value: 0.0, unit: 'rad', step: 0.1, min: -Math.PI, max: Math.PI },
                duration: { name: 'Duration', value: 20, unit: 'ms', step: 10, min: 1, max: 1000, convertedToMili: true },
                Te: { name: 'Sampling Interval', value: 4, unit: 'µs', step: 1, min: 1, max: 10000, convertedToMili: true },
                impulse_period: { name: 'Impulse Period', value: 2, unit: 'ms', step: 0.1, min: 0.1, max: 1000, convertedToMili: true }
            }),
            endPoint: '/sample_sinus'
        },
        {
            name: 'Faded Signal',
            description: 'Generates a sinusoidal signal with multipath fading applied.',
            params: JSON.stringify({
                duration: { name: 'Duration', value: 1.0, unit: 's', step: 0.1, min: 0.1, max: 10 },
                Te: { name: 'Time Step', value: 1, unit: 'ms', step: 0.1, min: 0.1, max: 10, convertedToMili: true },
                amplitude: { name: 'Amplitude', value: 1.0, unit: 'V', step: 0.1, min: 0.1, max: 10 },
                freq: { name: 'Frequency', value: 5.0, unit: 'Hz', step: 0.5, min: 0.1, max: 100 },
                phase: { name: 'Phase', value: 0.0, unit: 'rad', step: 0.1, min: -Math.PI, max: Math.PI },
                fading_model: { name: 'Fading Model', value: 2, unit: '', step: 1, min: 0, max: 22, dropdown: [0, 1, 11, 2, 22] },
                num_paths: { name: 'Number of Paths', value: 500, unit: '', step: 10, min: 10, max: 1000 }
            }),
            endPoint: '/fading'
        }
    ];





    try {
        await prisma.simulation.createMany({ data: simulationData });
        // for (const quiz of chapterQuizzes) {
        //     console.log(quiz);
        //     await prisma.quizes.create({
        //         data: {
        //             question: quiz.explanation,
        //             explaination: quiz.explanation,
        //             correctAnswerIndex: quiz.correctAnswer,
        //             options: quiz.options
        //         }
        //     });
        // }
        return NextResponse.json({
            succes: "worked"
        });
    } catch (error) {
        return NextResponse.json({
            error
        });
    }


}