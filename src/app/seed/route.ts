import { NextRequest, NextResponse } from "next/server";
import prisma from "../lib/prisma";

export async function GET(req: NextRequest) {
    try {

        const simulationRayleigh = await prisma.simulation.create({
            data: {
                name: 'Signal avec évanouissement',
                description: 'Génère un signal sinusoïdal avec application d\'évanouissement multitrajets.',
                params: JSON.stringify({
                    duration: { name: 'Durée', value: 1.0, unit: 's', step: 0.1, min: 0.1, max: 10 },
                    Te: { name: 'Pas de temps', value: 1, unit: 'ms', step: 0.1, min: 0.1, max: 10, convertedToMili: true },
                    amplitude: { name: 'Amplitude', value: 1.0, unit: 'V', step: 0.1, min: 0.1, max: 10 },
                    freq: { name: 'Fréquence', value: 5.0, unit: 'Hz', step: 0.5, min: 0.1, max: 100 },
                    phase: { name: 'Phase', value: 0.0, unit: 'rad', step: 0.1, min: -Math.PI, max: Math.PI },
                    fading_model: { name: 'Modèle d\'évanouissement', value: 2, unit: '', step: 1, min: 0, max: 22, dropdown: [0, 1, 11, 2, 22] },
                    num_paths: { name: 'Nombre de trajets', value: 500, unit: '', step: 10, min: 10, max: 1000 },

                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: '/fading',
            }
        });


        await prisma.courses.create({
            data: {
                title: "Canal de Fading Rayleigh",
                description: "Explorez le modèle du canal de fading Rayleigh, utilisé pour les environnements sans ligne de vue directe.",
                icon: "Signal",
                chapters: {
                    create: [
                        {
                            name: "Définition du Canal Rayleigh",
                            icon: "BookOpen",
                            body: `
## Définition du Canal Rayleigh

Le canal de fading Rayleigh est un modèle de propagation utilisé lorsque le signal reçu est composé uniquement de **composantes diffusées** (multipaths), sans composante en ligne de vue (LOS). Ce modèle est typique des environnements urbains denses où les obstacles bloquent le trajet direct entre l’émetteur et le récepteur.

### Contexte
Dans ce modèle, les multiples trajets réfléchis arrivent avec des amplitudes et des phases aléatoires, créant des variations rapides de l’amplitude du signal reçu, connues sous le nom de **fading**.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quand utilise-t-on le modèle de Rayleigh ?",
                                        options: [
                                            "Lorsqu’il y a une composante LOS forte",
                                            "Lorsqu’il n’y a pas de composante LOS",
                                            "Pour les environnements avec peu d’obstacles",
                                            "Pour les communications satellites"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le canal Rayleigh est utilisé lorsque le signal reçu est uniquement composé de multipaths, sans composante LOS."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Distribution de Rayleigh",
                            icon: "ChartLine",
                            body: `
## Distribution de Rayleigh

Dans le canal Rayleigh, l’amplitude du signal reçu $$ |h| $$ suit une **distribution de Rayleigh**. Si le canal est modélisé comme un nombre complexe $$ h = X + jY $$, où $$ X $$ et $$ Y $$ sont des variables gaussiennes centrées :

$$
X \\sim N(0, \\sigma^2), \\quad Y \\sim N(0, \\sigma^2)
$$

Alors, l’amplitude $$ |h| = \\sqrt{X^2 + Y^2} $$ suit :

$$
f_{|h|}(r) = \\frac{r}{\\sigma^2} \\exp\\left(-\\frac{r^2}{2\\sigma^2}\\right), \\quad r \\geq 0
$$

### Interprétation
La distribution de Rayleigh décrit les variations d’amplitude dues aux interférences constructives et destructives des multipaths.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle distribution suit l’amplitude $$ |h| $$ dans un canal Rayleigh ?",
                                        options: [
                                            "Normale",
                                            "Rayleigh",
                                            "Rician",
                                            "Uniforme"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "L’amplitude suit une distribution de Rayleigh, caractéristique des canaux sans composante LOS."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Effet du Fading sur le Signal",
                            icon: "Waveform",
                            body: `
## Effet du Fading sur le Signal

Le fading Rayleigh provoque des **fluctuations rapides** de l’amplitude et de la phase du signal reçu, ce qui peut entraîner :

- **Pertes de signal** : Des baisses soudaines de la puissance reçue.
- **Erreurs de transmission** : Augmentation du taux d’erreur binaire (BER).

### Conséquences
Ces variations nécessitent des techniques de mitigation comme la diversité (fréquence, temps, espace) ou le codage correcteur d’erreurs pour maintenir la fiabilité des communications.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est un effet clé du fading Rayleigh sur le signal ?",
                                        options: [
                                            "Augmentation constante de la puissance",
                                            "Fluctuations rapides de l’amplitude",
                                            "Réduction du bruit",
                                            "Stabilité de la phase"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le fading Rayleigh cause des fluctuations rapides de l’amplitude dues aux interférences des multipaths."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Modélisation Mathématique",
                            icon: "Calculator",
                            body: `
## Modélisation Mathématique

Le canal Rayleigh est modélisé par :

$$
h = \\sigma \\cdot (N(0,1) + j N(0,1))
$$

Où :
- $$ \\sigma^2 $$ : Variance des composantes gaussiennes, représentant la puissance moyenne des multipaths.

### Puissance Moyenne
La puissance moyenne du canal est :

$$
E[|h|^2] = 2\\sigma^2
$$

Pour normaliser à 1, on choisit $$ \\sigma = \\sqrt{\\frac{1}{2}} $$.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est la puissance moyenne $$ E[|h|^2] $$ dans un canal Rayleigh normalisé ?",
                                        options: [
                                            "1",
                                            "2\\sigma^2",
                                            "\\sigma^2",
                                            "0"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "Pour un canal normalisé, $$ E[|h|^2] = 1 $$, avec $$ \\sigma = \\sqrt{\\frac{1}{2}} $$."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Applications",
                            icon: "Applications",
                            body: `
## Applications

Le modèle de Rayleigh est largement utilisé pour :

- **Communications mobiles** : Dans les zones urbaines denses où la LOS est souvent bloquée.
- **Réseaux sans fil** : Pour modéliser les canaux WiFi ou Bluetooth en intérieur.
- **Études de performance** : Évaluer l’efficacité des techniques de mitigation du fading.

### Exemples
- **4G/5G** : Prédiction de la qualité du signal dans les cellules urbaines.
- **WiFi** : Estimation des variations de signal dans les bâtiments.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Dans quel scénario le canal Rayleigh est-il le plus approprié ?",
                                        options: [
                                            "Communications satellites",
                                            "Environnements urbains denses",
                                            "Liaisons en espace libre",
                                            "Canaux avec forte LOS"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le canal Rayleigh est idéal pour les environnements urbains denses où la LOS est souvent absente."
                                    }
                                ]
                            },
                            simulationId: simulationRayleigh.simulationId
                        }
                    ]
                },
                channelType: "Fading",
            }
        });


        const simulationRicianConvolv = await prisma.simulation.create({
            data: {
                name: "Simulation du Canal Rician Convolution",
                description: "Simule les caractéristiques du canal Rician avec une composante LOS et des multipaths.",
                params: JSON.stringify({
                    k_db: { name: "Facteur K", value: 10, unit: "dB", step: 1, min: -10, max: 20 },
                    signal_power: { name: "Puissance du Signal", value: 1, unit: "W", step: 0.1, min: 0.1, max: 10 },
                    show_signal_type: { name: "Rician signal Type", value: "convol_sign", options: [] },
                    frequency_hz: { name: "Fréquence du signal", value: 1000.0, unit: "Hz", step: 10, min: 20, max: 10000 },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showLoss: { name: "Afficher la Perte", value: "Oui", options: ["Oui", "Non"] },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },

                }),
                endPoint: "/rician"
            }
        });

        const simulationRicianChannel = await prisma.simulation.create({
            data: {
                name: "Simulation du Canal Rician",
                description: "Simule les caractéristiques du canal Rician avec une composante LOS et des multipaths.",
                params: JSON.stringify({
                    k_db: { name: "Facteur K", value: 10, unit: "dB", step: 1, min: -10, max: 20 },
                    signal_power: { name: "Puissance du Signal", value: 1, unit: "W", step: 0.1, min: 0.1, max: 10 },
                    show_signal_type: { name: "Rician signal Type", value: "rician_channel", options: [] },
                    frequency_hz: { name: "Fréquence du signal", value: 1000.0, unit: "Hz", step: 10, min: 20, max: 10000 },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showLoss: { name: "Afficher la Perte", value: "Oui", options: ["Oui", "Non"] },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/rician"
            }
        });

        const simulationRicianChannelDB = await prisma.simulation.create({
            data: {
                name: "Simulation du Canal Rician en db",
                description: "Simule les caractéristiques du canal Rician avec une composante LOS et des multipaths.",
                params: JSON.stringify({
                    k_db: { name: "Facteur K", value: 10, unit: "dB", step: 1, min: -10, max: 20 },
                    signal_power: { name: "Puissance du Signal", value: 1, unit: "W", step: 0.1, min: 0.1, max: 10 },
                    show_signal_type: { name: "Rician signal Type", value: "ricianchannel_db", options: [] },
                    frequency_hz: { name: "Fréquence du signal", value: 1000.0, unit: "Hz", step: 10, min: 20, max: 10000 },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showLoss: { name: "Afficher la Perte", value: "Oui", options: ["Oui", "Non"] },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },

                }),
                endPoint: "/rician"
            }
        });
        await prisma.courses.create({
            data: {
                title: "Canal Rician",
                description: "Explorez le modèle du canal Rician, un modèle de propagation avec une composante en ligne de vue et des multipaths.",
                icon: "Signal",
                chapters: {
                    create: [
                        {
                            name: "Définition du Canal Rician",
                            icon: "BookOpen",
                            body: `
## Définition du Canal Rician

Le canal Rician est un modèle de propagation utilisé en télécommunications pour décrire la réception d’un signal composé de deux éléments principaux :
- Une **composante en ligne de vue (LOS)** : un trajet direct entre l’émetteur et le récepteur.
- Des **composantes diffusées (multipaths)** : plusieurs trajets réfléchis ou dispersés, modélisés comme des variables aléatoires gaussiennes.

Ce modèle est particulièrement pertinent dans des environnements où une trajectoire dominante existe (par exemple, en milieu urbain avec une vue partielle ou en communications satellites).
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que contient le signal reçu dans un canal Rician ?",
                                        options: [
                                            "Uniquement une composante LOS",
                                            "Une composante LOS et des multipaths",
                                            "Seulement des multipaths",
                                            "Un signal constant"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le canal Rician inclut une composante en ligne de vue (LOS) et des multipaths modélisés comme des gaussiennes."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Facteur K (K-Factor)",
                            icon: "Sliders",
                            body: `
## Facteur K (K-Factor)

Le facteur K mesure le rapport entre la puissance de la composante en ligne de vue (LOS) et celle des composantes diffusées :

$$
K = \\frac{P_{LOS}}{P_{diffusée}}
$$

### En Décibels
$$
K_{dB} = 10 \\cdot \\log_{10}(K)
$$

### Conversion Inverse
$$
K = 10^{\\frac{K_{dB}}{10}}
$$

Un $$ K $$ élevé indique une dominance de la composante LOS, tandis qu’un $$ K $$ faible se rapproche d’un canal Rayleigh (pas de LOS).
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que représente un facteur K élevé ?",
                                        options: [
                                            "Une forte dominance des multipaths",
                                            "Une forte dominance de la composante LOS",
                                            "Un signal constant",
                                            "Une absence de LOS"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Un facteur K élevé signifie que la composante LOS domine sur les multipaths."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Distribution du Canal Rician",
                            icon: "ChartLine",
                            body: `
## Distribution du Canal Rician (Modèle Complexe)

Le canal Rician est représenté par un nombre complexe :

$$
h = X + jY
$$

Où :
- $$ X \\sim N(\\mu, \\sigma^2) $$ : Partie réelle, suivant une distribution normale.
- $$ Y \\sim N(\\mu, \\sigma^2) $$ : Partie imaginaire, suivant une distribution normale.

Cela peut être écrit comme :
$$
h = (\\sigma \\cdot N(0,1) + \\mu) + j(\\sigma \\cdot N(0,1) + \\mu)
$$

Ici, $$ \\mu $$ représente l’amplitude de la composante LOS, et $$ \\sigma^2 $$ la variance des multipaths.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle distribution suit la partie réelle X dans un canal Rician ?",
                                        options: [
                                            "Uniforme",
                                            "Normale",
                                            "Exponentielle",
                                            "Binomiale"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "La partie réelle  X suit une distribution normale  N(\\mu, \\sigma^2) dans le modèle Rician."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Paramètres Statistiques",
                            icon: "Stats",
                            body: `
## Paramètres Statistiques

Les paramètres du canal Rician sont dérivés du facteur $$ K $$ pour normaliser la puissance moyenne de $$ h $$ à 1 :

### Moyenne $$ \\mu $$
$$
\\mu = \\sqrt{\\frac{K}{2(K + 1)}}
$$

### Écart-type $$ \\sigma $$
$$
\\sigma = \\sqrt{\\frac{1}{2(K + 1)}}
$$

Ces valeurs équilibrent la contribution de la composante LOS et des multipaths dans la puissance totale.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que représente \\sigma dans le canal Rician ?",
                                        options: [
                                            "La moyenne de la LOS",
                                            "L’écart-type des multipaths",
                                            "La puissance totale",
                                            "Le facteur K"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "L’écart-type \\sigma = \\sqrt{\\frac{1}{2(K + 1)}} mesure la dispersion des multipaths."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Amplitude du Canal Rician",
                            icon: "Waveform",
                            body: `
## Amplitude du Canal Rician

L’amplitude du canal $$ |h| $$ est calculée comme :

$$
|h| = \\sqrt{X^2 + Y^2}
$$

Cette amplitude suit une **loi de Rice** (Rician distribution) :

$$
f_{|h|}(r) = \\frac{r}{\\sigma^2} \\exp\\left(-\\frac{r^2 + A^2}{2\\sigma^2}\\right) I_0\\left(\\frac{rA}{\\sigma^2}\\right), \\quad r \\geq 0
$$

Où :
- $$ A = \\sqrt{2} \\cdot \\mu $$ : Amplitude de la composante LOS.
- $$ I_0 $$ : Fonction de Bessel modifiée du premier type, ordre 0.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle loi suit l’amplitude |h| dans un canal Rician ?",
                                        options: [
                                            "Normale",
                                            "Rayleigh",
                                            "Rice",
                                            "Uniforme"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "L’amplitude |h| suit une distribution de Rice, caractéristique du canal Rician."
                                    }
                                ]
                            },
                            simulationId: simulationRicianChannel.simulationId
                        },
                        {
                            name: "Conversion en dB",
                            icon: "Calculator",
                            body: `
## Conversion en dB

Pour analyser les puissances ou amplitudes en décibels :

### Puissance
$$
P_{dB} = 10 \\cdot \\log_{10}(P)
$$

### Amplitude
Dans les simulations, on utilise souvent :
$$
|h|_{dB} = 10 \\cdot \\log_{10}(|h|)
$$
(Note : Pour une amplitude pure, $$ 20 \\cdot \\log_{10}(|h|) $$ serait plus rigoureux, mais $$ 10 \\cdot \\log_{10}(|h|) $$ est commun en analyse de canaux.)

Cela permet de comparer les niveaux de signal dans des unités logarithmiques.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Comment convertit-on la puissance en dB ?",
                                        options: [
                                            "10 \\cdot \\log_{10}(P)",
                                            "20 \\cdot \\log_{10}(P)",
                                            "\\log_{10}(P)",
                                            "P \\cdot 10"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "La puissance en dB est calculée par  P_{dB} = 10 \\cdot \\log_{10}(P) ."
                                    }
                                ]
                            },
                            simulationId: simulationRicianChannelDB.simulationId
                        },
                        {
                            name: "Convolution avec le Signal",
                            icon: "Signal",
                            body: `
## Convolution avec le Signal

Lorsqu’un signal transmis $$ x(t) $$ traverse un canal Rician $$ h(t) $$, le signal reçu est :

$$
y(t) = h(t) * x(t)
$$

Où $$ * $$ désigne la convolution. Cette opération combine l’effet du canal (LOS et multipaths) avec le signal d’entrée, modifiant son amplitude et sa phase selon les caractéristiques du canal Rician.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que représente y(t) = h(t) * x(t) dans un canal Rician ?",
                                        options: [
                                            "La puissance du signal",
                                            "Le signal reçu après convolution",
                                            "La composante LOS seule",
                                            "Le bruit ajouté"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Cela représente le signal reçu, résultat de la convolution entre le canal h(t) et le signal transmis x(t) "
                                    }
                                ]
                            },
                            simulationId: simulationRicianConvolv.simulationId
                        }
                    ]
                },
                channelType: "Fading",
            }
        });


        // Création de la simulation pour le modèle de Nakagami Fading
        const simulationNakagami = await prisma.simulation.create({
            data: {
                name: "Simulation du Canal de Fading Nakagami",
                description: "Simule les variations d'amplitude du signal dans un canal sans fil en utilisant le modèle de fading Nakagami.",
                params: JSON.stringify({
                    frequency_hz: { name: "Fréquence du signal", value: 900.0, unit: "Hz", step: 10, min: 20, max: 10000 },
                    m: { name: "Paramètre de forme m", value: 1.0, unit: "", step: 0.1, min: 0.5, max: 10 },
                    omega: { name: "Paramètre d'étalement Ω", value: 1.0, unit: "", step: 0.1, min: 0.1, max: 10 },
                    signal_power: { name: "Puissance du signal", value: 3.0, unit: "W", step: 0.1, min: 0.1, max: 10 },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showLoss: { name: "Afficher la Perte", value: "Oui", options: ["Oui", "Non"] },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/nakagami-fading-signal"
            }
        });

        // Création du cours avec ses chapitres
        await prisma.courses.create({
            data: {
                title: "Canal de Fading Nakagami",
                description: "Découvrez le modèle de fading Nakagami, un modèle statistique flexible pour les variations d'amplitude du signal dans les canaux sans fil.",
                icon: "RadioTower",
                chapters: {
                    create: [
                        {
                            name: "Introduction au Fading Nakagami",
                            icon: "BookOpen",
                            body: `
## Introduction au Fading Nakagami

Le modèle de fading Nakagami est un modèle statistique utilisé pour décrire les variations d'amplitude des signaux dans les canaux de communication sans fil. Il est particulièrement flexible, permettant de représenter différentes conditions de fading, contrairement au modèle de Rayleigh (sans trajet dominant) ou au modèle de Rician (avec un composant en ligne de mire). Ses deux paramètres principaux, le paramètre de forme $$ m $$ et le paramètre d'étalement $$ \\Omega $$, en font un outil puissant pour modéliser le fading dans divers scénarios de propagation multipath.

Ce modèle joue un rôle clé dans les communications sans fil en offrant une approche adaptable aux environnements réels.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que décrit principalement le modèle de fading Nakagami ?",
                                        options: [
                                            "La puissance du signal",
                                            "Les variations d'amplitude du signal",
                                            "La phase du signal",
                                            "La fréquence du signal"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle de fading Nakagami se concentre sur les variations d'amplitude du signal dans les canaux sans fil, offrant une flexibilité pour diverses conditions de fading."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Modèle Mathématique",
                            icon: "Calculator",
                            body: `
## Modèle Mathématique

La fonction de densité de probabilité (PDF) du modèle de Nakagami pour l'amplitude du signal $$ r $$ est donnée par :

$$ f(r) = \\frac{2 m^m}{\\Gamma(m) \\Omega^m} r^{2m - 1} \\exp\\left(-\\frac{m}{\\Omega} r^2\\right) $$

### Paramètres :
- $$ m $$ : Paramètre de forme ($$ m \\geq 0.5 $$), qui contrôle la sévérité du fading.
- $$ \\Omega $$ : Paramètre d'étalement, qui représente la puissance moyenne du signal.
- $$ \\Gamma(m) $$ : Fonction gamma, assurant la normalisation de la distribution.

Cette équation permet de modéliser les variations d'amplitude en ajustant $$ m $$ et $$ \\Omega $$ selon les conditions du canal.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est le rôle du paramètre $$ m $$ dans le modèle de Nakagami ?",
                                        options: [
                                            "Il représente la puissance moyenne",
                                            "Il affecte la sévérité du fading",
                                            "Il détermine la fréquence du signal",
                                            "Il contrôle la phase du signal"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le paramètre $$ m $$ détermine la sévérité du fading : un $$ m $$ faible indique un fading sévère, tandis qu'un $$ m $$ élevé indique un fading plus léger."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Interprétation des Paramètres",
                            icon: "Info",
                            body: `
## Interprétation des Paramètres

### Paramètre de forme $$ m $$ :
- Lorsque $$ m = 1 $$, le modèle correspond au fading de Rayleigh (fading sévère sans trajet dominant).
- Pour $$ m > 1 $$, le fading devient moins sévère, et à mesure que $$ m $$ augmente, il tend vers un canal sans fading.
- Pour $$ 0.5 \\leq m < 1 $$, le fading est plus sévère que celui de Rayleigh.

### Paramètre d'étalement $$ \\Omega $$ :
- $$ \\Omega $$ représente la puissance moyenne et ajuste l'échelle des variations d'amplitude.

Cette flexibilité permet au modèle de Nakagami de s'adapter à une large gamme de conditions de fading, le rendant plus polyvalent que les modèles Rayleigh ou Rician dans certains cas.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que se passe-t-il lorsque $$ m = 1 $$ dans le modèle de Nakagami ?",
                                        options: [
                                            "Le modèle devient un canal sans fading",
                                            "Le modèle se réduit au fading de Rayleigh",
                                            "Le fading devient plus sévère",
                                            "La puissance moyenne augmente"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "À $$ m = 1 $$, le modèle de Nakagami équivaut au modèle de Rayleigh, représentant un fading sévère sans trajet dominant."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Effets sur la Transmission du Signal",
                            icon: "Waveform",
                            body: `
## Effets sur la Transmission du Signal

Le paramètre $$ m $$ a un impact direct sur la transmission du signal :
- **Faible $$ m $$ (proche de 0.5)** : Le fading est sévère, provoquant des baisses fréquentes et profondes de l'amplitude, ce qui augmente les erreurs (par exemple, le taux d'erreur binaire, BER).
- **$$ m = 1 $$** : Équivaut au fading de Rayleigh, avec des variations modérées.
- **$$ m > 1 $$** : Le fading devient plus léger, stabilisant l'amplitude et réduisant les erreurs.

Ces effets sont essentiels pour concevoir des systèmes de communication capables de s'adapter aux conditions de fading variables.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est l'effet d'un faible $$ m $$ sur la transmission du signal ?",
                                        options: [
                                            "Stabilisation de l'amplitude",
                                            "Augmentation des erreurs",
                                            "Réduction du taux d'erreur",
                                            "Aucune influence"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Un faible $$ m $$ entraîne un fading sévère, augmentant les baisses d'amplitude et donc les erreurs de transmission."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Applications",
                            icon: "Applications",
                            body: `
## Applications

Le modèle de Nakagami est utilisé dans plusieurs domaines des télécommunications :
- **Modélisation du fading à petite échelle** : Pour simuler les variations rapides du signal dans divers environnements.
- **Analyse des performances** : Pour évaluer l'impact du fading sur la modulation, le codage et les techniques de diversité.
- **Simulation de canaux** : Pour tester et optimiser les systèmes sans fil, comme les réseaux 4G/5G ou WiFi.

Sa capacité à modéliser diverses conditions de fading en fait un outil précieux pour la recherche et le développement.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est l'application principale du modèle de Nakagami ?",
                                        options: [
                                            "Modélisation du fading à grande échelle",
                                            "Modélisation du fading à petite échelle",
                                            "Estimation de la puissance du signal",
                                            "Détermination de la phase du signal"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle de Nakagami est principalement utilisé pour modéliser le fading à petite échelle, simulant les variations rapides du signal."
                                    }
                                ]
                            },
                            simulationId: simulationNakagami.simulationId
                        }
                    ]
                },
                channelType: "Fading",
            }
        });


        const simulationFSPL = await prisma.simulation.create({
            data: {
                name: "Paramètres du Canal en Espace Libre",
                description: "Simule la perte de propagation en espace libre (FSPL) pour estimer l'atténuation du signal.",
                params: JSON.stringify({
                    carrier_frequency_MHz: { name: "Fréquence du canal", value: 2.4, step: 0.5, min: 1, max: 6 },
                    baseband_frequency_Hz: { name: "Fréquence du signal", value: 1000, unit: "Hz", step: 50, min: 100, max: 100000 },
                    distance_m: { name: "Distance entre Tx et Rx", value: 1, unit: "Km", step: 50, min: 1, max: 10000 },

                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/fspl"
            }
        });

        await prisma.courses.create({
            data: {
                title: "Canal en Espace Libre (FSPL)",
                description: "Explorez le modèle de perte de propagation en espace libre, une base essentielle pour comprendre l'atténuation des signaux dans les télécommunications sans fil.",
                icon: "Signal",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "BookOpen",
                            body: `
## Définition

Le canal en espace libre, également connu sous le nom de *Free Space Path Loss* (FSPL), est un modèle simple mais fondamental en télécommunications. Il permet d’estimer la perte de puissance d’un signal radio lorsqu’il se propage dans un milieu sans obstacle, comme le vide ou l’air, en l’absence de réflexions, de réfractions ou de diffractions. Ce modèle représente une situation idéale où l’énergie de l’onde se disperse de manière sphérique à partir de l’émetteur.

### Rôle dans les Télécommunications
Le FSPL est une première étape pour comprendre comment la distance et la fréquence affectent la puissance reçue, servant de point de départ pour des analyses plus complexes dans des environnements réels.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que représente le modèle FSPL ?",
                                        options: [
                                            "La perte de puissance dans un milieu avec obstacles",
                                            "La perte de puissance dans un espace sans obstacles",
                                            "L’augmentation de la puissance avec la distance",
                                            "La réflexion des ondes sur les bâtiments"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le FSPL estime la perte de puissance d’un signal dans un espace libre, sans obstacles, réflexions ni diffractions."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Hypothèses du Modèle",
                            icon: "Sliders",
                            body: `
## Hypothèses du Modèle

Le modèle FSPL repose sur des conditions idéales pour simplifier l’analyse de la propagation des ondes radio. Ces hypothèses sont essentielles pour comprendre ses limites et son applicabilité.

### Hypothèses Clés
- **Propagation dans le vide ou l’air sans obstacle** : Aucun objet physique (bâtiments, arbres) n’interfère avec le signal.
- **Pas de réflexion, réfraction, ni diffusion** : Le signal suit une trajectoire en ligne droite sans déviation ou dispersion par l’environnement.
- **Antennes parfaitement alignées** : Les émetteurs et récepteurs sont idéalement positionnés, sans pertes dues à un mauvais alignement ou à des imperfections matérielles.

### Implications
Ces hypothèses font du FSPL un modèle théorique, utile comme référence, mais nécessitant des ajustements pour des scénarios réels où ces conditions ne sont pas remplies.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle hypothèse est essentielle au modèle FSPL ?",
                                        options: [
                                            "Présence de réflexions multiples",
                                            "Propagation sans obstacles",
                                            "Antennes désalignées",
                                            "Diffusion par les obstacles"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le FSPL suppose une propagation dans un milieu sans obstacles, comme le vide ou l’air, pour une analyse simplifiée."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Formule",
                            icon: "Calculator",
                            body: `
## Formule

La perte de propagation en espace libre (FSPL) est calculée à l’aide d’une équation qui dépend de la distance et de la fréquence du signal.

### Formule Générale
En décibels (dB) :

$$
FSPL (dB) = 20 log₁₀(d) + 20 log₁₀(f) + 20 log₁₀(4π/c)
$$

ou, simplifiée :

$$
FSPL (dB) = 20 log₁₀(d) + 20 log₁₀(f) - 147.55
$$

où :
- $$ d $$ : distance entre l’émetteur et le récepteur (en mètres)
- $$ f $$ : fréquence du signal (en Hz)
- $$ c $$ : vitesse de la lumière ≈ $$ 3 × 10^8 $$ m/s

### Version Pratique (km et MHz)
Pour des unités courantes en télécommunications :

$$
FSPL (dB) = 32.45 + 20 log₁₀(d_km) + 20 log₁₀(f_MHz)
$$

où :
- $$ d_km $$ : distance en kilomètres
- $$ f_MHz $$ : fréquence en mégahertz

### Exemple
Pour $$ d = 1 $$ km et $$ f = 2400 $$ MHz :
$$
FSPL = 32.45 + 20 log₁₀(1) + 20 log₁₀(2400) = 32.45 + 0 + 67.6 = 100.05 dB
$$`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est l’unité de la fréquence dans la formule FSPL en km et MHz ?",
                                        options: [
                                            "Hertz (Hz)",
                                            "Kilohertz (kHz)",
                                            "Mégahertz (MHz)",
                                            "Gigahertz (GHz)"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "Dans la formule FSPL = 32.45 + 20 log₁₀(d_km) + 20 log₁₀(f_MHz), la fréquence est exprimée en mégahertz (MHz)."
                                    },
                                    {
                                        question: "Que se passe-t-il si la fréquence double dans la formule FSPL ?",
                                        options: [
                                            "La perte augmente de 6 dB",
                                            "La perte diminue de 6 dB",
                                            "La perte reste inchangée",
                                            "La perte est divisée par deux"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "Doubler la fréquence (facteur 2) augmente la perte de 20 log₁₀(2) ≈ 6 dB, car elle est logarithmique."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Effet Principal",
                            icon: "Waveform",
                            body: `
## Effet Principal

Le modèle FSPL met en évidence l’impact de la distance et de la fréquence sur la puissance reçue.

### Description de l’Effet
- **Distance** : La puissance diminue avec le carré de la distance $$ 1/d^2 $$, ce qui se traduit par une augmentation logarithmique de la perte (20 log₁₀(d)) en dB.
- **Fréquence** : Une fréquence plus élevée accroît la perte, car les ondes à haute fréquence se dispersent davantage, suivant également une relation logarithmique (20 log₁₀(f)).

### Conséquence
Plus la distance ou la fréquence augmente, plus la puissance reçue diminue rapidement, rendant les longues distances ou les hautes fréquences plus difficiles à gérer sans amplification.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Comment la puissance reçue varie-t-elle avec la distance dans le modèle FSPL ?",
                                        options: [
                                            "Elle augmente avec le carré de la distance",
                                            "Elle diminue avec le carré de la distance",
                                            "Elle reste constante",
                                            "Elle augmente linéairement"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Dans le FSPL, la puissance reçue diminue avec le carré de la distance 1/d^2, ce qui se traduit par une perte logarithmique en dB."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Utilité",
                            icon: "BarChart",
                            body: `
## Utilité

Le modèle FSPL est une référence essentielle dans la conception et l’analyse des systèmes sans fil.

### Applications
- **Référence de Base** : Permet de comparer les performances avec des modèles plus complexes comme Okumura-Hata ou COST 231, qui incluent des facteurs environnementaux.
- **Planification des Liaisons Sans Fil** : Utilisé pour estimer la perte dans des systèmes comme le WiFi, les communications par satellite, ou les réseaux 5G en conditions idéales (ligne de vue).

### Exemples Pratiques
- **WiFi** : Calcul de la portée d’un routeur à 2.4 GHz ou 5 GHz.
- **Satellites** : Estimation des pertes sur de longues distances dans l’espace.
- **5G** : Base pour les fréquences sub-6 GHz en ligne de vue, avant ajustements.

### Limites
Le FSPL est idéal et ne reflète pas les conditions réelles (obstacles, réflexions), mais il reste un point de départ crucial pour la planification.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "À quoi sert principalement le modèle FSPL dans la planification des réseaux ?",
                                        options: [
                                            "Estimer les pertes dues aux bâtiments",
                                            "Servir de référence pour comparer avec d’autres modèles",
                                            "Calculer les réflexions dans les zones urbaines",
                                            "Optimiser la consommation d’énergie"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le FSPL est utilisé comme une référence de base pour comparer ses résultats avec ceux de modèles plus complexes tenant compte des obstacles."
                                    }
                                ]
                            },
                            simulationId: simulationFSPL.simulationId
                        }
                    ]
                },
                channelType: "PathLoss",
            }
        });


        const simulationITU = await prisma.simulation.create({
            data: {
                name: "Paramètres du Canal en Milieu Urbain",
                description: "Simule la perte de propagation en milieu urbain selon le modèle ITU-R P.1411.",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 2400, unit: "MHz", step: 100, min: 300, max: 100000 },
                    d_min: { name: "Distance minimale", value: 1, unit: "m", step: 1, min: 1, max: 1000 },
                    d_max: { name: "Distance maximale", value: 1000, unit: "m", step: 10, min: 1, max: 10000 },
                    environment: { name: "Environnement", value: "urban", options: ["urban", "suburban", "open"] },
                    f_signal: { name: "Fréquence du signal", value: 10, unit: "Hz", step: 0.1, min: 0.1, max: 10 },
                    amplitude: { name: "Amplitude du signal", value: 10, unit: "dB", step: 1, min: 0, max: 50 },
                    P0: { name: "Puissance moyenne", value: 0, unit: "dBm", step: 1, min: -50, max: 50 },

                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                }),
                endPoint: "/itu-r-p1411"
            }
        });

        await prisma.courses.create({
            data: {
                title: "ITU-R P.1411",
                description: "Découvrez la propagation en milieu urbain avec le modèle ITU-R P.1411, adapté aux environnements bâtis et aux technologies modernes comme la 5G.",
                icon: "City",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "BookOpen",
                            body: `
## Définition

Le canal en milieu urbain décrit la propagation des ondes radio dans des zones fortement influencées par des obstacles physiques tels que les bâtiments, les véhicules et autres structures. Contrairement au modèle en espace libre, ce canal est caractérisé par la présence de **réflexions**, **diffractions** et **diffusion**, qui compliquent la prédiction de la perte de signal.

### Contexte
En milieu urbain, les ondes radio ne se propagent pas en ligne droite de manière idéale. Elles interagissent avec l’environnement, ce qui nécessite des modèles spécifiques pour estimer la couverture et la qualité du signal dans des applications comme les réseaux cellulaires ou le WiFi.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Qu’est-ce qui distingue le canal en milieu urbain du canal en espace libre ?",
                                        options: [
                                            "L’absence d’obstacles",
                                            "La présence de réflexions et diffractions",
                                            "Une propagation uniquement en ligne de vue",
                                            "Une fréquence limitée à 300 MHz"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le canal en milieu urbain est influencé par les réflexions, diffractions et diffusions dues aux bâtiments et obstacles, contrairement à l’espace libre."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Modèles Courants",
                            icon: "List",
                            body: `
## Modèles Courants

Plusieurs modèles sont utilisés pour prédire la propagation en milieu urbain, chacun adapté à des scénarios spécifiques.

### Principaux Modèles
- **COST 231-Hata** : Optimisé pour les communications cellulaires (GSM, LTE), couvrant les fréquences de 800 MHz à 2000 MHz, avec un focus sur les environnements urbains, suburbains et ruraux.
- **Okumura-Hata** : Basé sur des mesures empiriques, idéal pour les zones urbaines avec obstacles, souvent utilisé pour les réseaux mobiles historiques.
- **ITU-R P.1411** : Conçu pour les courtes distances en milieu urbain, suburbain et intérieur/extérieur, couvrant une large gamme de fréquences (300 MHz à 100 GHz), et adapté aux technologies modernes comme la 5G et le WiFi 6E.

### Comparaison
Alors que COST 231-Hata et Okumura-Hata sont plus adaptés aux macro-cellules sur de grandes distances, ITU-R P.1411 excelle dans les petites distances et les environnements complexes.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel modèle est spécifiquement conçu pour les courtes distances en milieu urbain ?",
                                        options: [
                                            "COST 231-Hata",
                                            "Okumura-Hata",
                                            "ITU-R P.1411",
                                            "Free Space Path Loss"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "ITU-R P.1411 est conçu pour les petites distances (jusqu’à quelques centaines de mètres) en milieu urbain, contrairement aux autres modèles plus adaptés aux grandes échelles."
                                    }
                                ]
                            }
                        },
                        {
                            name: "ITU-R P.1411 : Présentation Rapide",
                            icon: "Info",
                            body: `
## ITU-R P.1411 : Présentation Rapide

### Nom Complet
*ITU-R P.1411 – Propagation data and prediction methods for the planning of short-range outdoor radiocommunication systems and radio local area networks in the frequency range 300 MHz to 100 GHz.*

### Principales Caractéristiques
- **Courtes Distances** : Conçu pour des portées allant jusqu’à quelques centaines de mètres.
- **Environnements Variés** : Applicable aux zones urbaines, suburbaines, et aux scénarios intérieur/extérieur.
- **Large Gamme de Fréquences** : Couvre de 300 MHz à 100 GHz, englobant les fréquences utilisées par la 5G, le WiFi 6E, et d’autres technologies modernes.
- **Scénarios Pris en Compte** :
- **Ligne de Vue (LOS)** : Propagation directe entre émetteur et récepteur.
- **Non-LOS (NLOS)** : Propagation avec obstacles entre l’émetteur (TX) et le récepteur (RX).
- Inclut les effets des **réflexions**, **diffractions**, et **obstructions** par les bâtiments ou autres structures.

### Utilité
Ce modèle est particulièrement pertinent pour le déploiement de réseaux sans fil modernes dans des environnements denses, comme les petites cellules 5G ou les réseaux locaux sans fil.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est la plage de fréquences couverte par ITU-R P.1411 ?",
                                        options: [
                                            "800 MHz à 2000 MHz",
                                            "300 MHz à 100 GHz",
                                            "2 GHz à 6 GHz",
                                            "100 MHz à 300 MHz"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "ITU-R P.1411 couvre une large gamme de fréquences, de 300 MHz à 100 GHz, adaptée aux technologies comme la 5G et le WiFi 6E."
                                    },
                                    {
                                        question: "Quel scénario ITU-R P.1411 prend-il en compte en plus de la ligne de vue (LOS) ?",
                                        options: [
                                            "Réflexions uniquement",
                                            "Non-LOS (NLOS) avec obstacles",
                                            "Propagation dans le vide",
                                            "Diffusion atmosphérique"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "ITU-R P.1411 inclut le scénario non-LOS (NLOS), prenant en compte les obstacles entre l’émetteur et le récepteur, ainsi que les réflexions et diffractions."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Formules Typiques (Simplifiées)",
                            icon: "Calculator",
                            body: `
## Formules Typiques (Simplifiées)

Le modèle ITU-R P.1411 propose des formules pour estimer la perte de propagation en milieu urbain, selon que la propagation est en ligne de vue (LOS) ou non (NLOS).

### Cas LOS (Ligne de Vue)
La perte en décibels (dB) est donnée par la formule de l’espace libre :

$$
L = 20 log₁₀(f) + 20 log₁₀(d) + 32.45
$$

où :
- $$ f $$ : fréquence en MHz
- $$ d $$ : distance en km

#### Exemple
Pour $$ f = 2400 $$ MHz (WiFi) et $$ d = 0.1 $$ km (100 m) :
$$
L = 20 log₁₀(2400) + 20 log₁₀(0.1) + 32.45 = 67.6 - 20 + 32.45 = 80.05 dB
$$

### Cas NLOS (Sans Ligne de Vue)
La perte est calculée comme :

$$
L = L_LOS + ∆L_NLOS
$$

où :
- $$ L_LOS $$ : perte en ligne de vue (calculée ci-dessus)
- $$ ∆L_NLOS $$ : perte supplémentaire due aux obstacles, qui dépend de :
- **Type d’environnement** : dense (urbain), modéré (suburbain), ou ouvert.
- **Réflexions et diffractions** : Impact des bâtiments et structures.
- **Obstructions** : Hauteur et densité des obstacles.

#### Note
$$ ∆L_NLOS $$ varie selon les conditions spécifiques et peut être déterminé par des mesures empiriques ou des tables fournies par ITU-R P.1411.

### Différence Clé
En LOS, la perte est similaire à celle de l’espace libre, tandis qu’en NLOS, des facteurs environnementaux augmentent significativement l’atténuation.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle formule est utilisée pour le cas LOS dans ITU-R P.1411 ?",
                                        options: [
                                            "L = 20 log₁₀(f) + 20 log₁₀(d) + 32.45",
                                            "L = 46.3 + 33.9 log₁₀(f)",
                                            "L = L_LOS + ∆L_NLOS",
                                            "L = 32.45 + 20 log₁₀(d)"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "Pour le cas LOS, ITU-R P.1411 utilise la formule de l’espace libre : L = 20 log₁₀(f) + 20 log₁₀(d) + 32.45."
                                    },
                                    {
                                        question: "Qu’est-ce qui est ajouté à la perte LOS pour calculer la perte NLOS ?",
                                        options: [
                                            "Une constante fixe de 10 dB",
                                            "Un facteur ∆L_NLOS dépendant de l’environnement",
                                            "La hauteur des antennes",
                                            "La vitesse de la lumière"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "En NLOS, la perte est L = L_LOS + ∆L_NLOS, où ∆L_NLOS dépend des obstacles, réflexions et de l’environnement."
                                    }
                                ]
                            },
                            simulationId: simulationITU.simulationId
                        }
                    ]
                },
                channelType: "Standard",
            }
        });

        const simulationHata = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Okumura-Hata",
                description: "Simule l'atténuation du signal radio selon le modèle Okumura-Hata dans divers environnements.",
                params: JSON.stringify({
                    f: { name: "Fréquence de canal", value: 900, unit: "MHz", step: 50, min: 150, max: 1500 },
                    signal_frequency: { name: "Fréquence du signal", value: 900, unit: "Hz", step: 100, min: 0, max: 5000 },
                    amplitude: { name: "Amplitude du signal", value: 1, unit: "V", step: 50, min: 1, max: 1000 },
                    h_b: { name: "Hauteur Station de Base", value: 30, unit: "m", step: 5, min: 30, max: 200 },
                    h_m: { name: "Hauteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
                    d: { name: "Distance entre Tx et Rx", value: 1, unit: "km", step: 1, min: 1, max: 20 },
                    environment: { name: "Environnement", value: "urban", options: ["urban", "suburban", "rural"] },
                    city_size: { name: "Taille de la Ville", value: "Moyenne et Petite", options: ["Grande", "Moyenne et Petite"] },

                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/hata"
            }
        });

        await prisma.courses.create({
            data: {
                title: "Modèle Okumura-Hata",
                description: "Découvrez le modèle Okumura-Hata, un modèle empirique pour estimer l'atténuation des signaux radio dans divers environnements.",
                icon: "RadioTower",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "Info",
                            body: `
## Définition

Le modèle Okumura-Hata est une adaptation empirique du modèle d'Okumura, conçu pour estimer l'atténuation du signal radio dans les environnements urbains, suburbains et ruraux. Il est particulièrement efficace pour :

- **Fréquences** : 150 MHz à 1500 MHz
- **Distances** : 1 km à 20 km

Ce modèle repose sur des mesures expérimentales réalisées par Okumura, simplifiées par Hata en formules pratiques pour la planification des réseaux de télécommunication.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est la plage de distances pour laquelle le modèle Okumura-Hata est applicable ?",
                                        options: [
                                            "0.5 km à 10 km",
                                            "1 km à 20 km",
                                            "5 km à 50 km",
                                            "10 km à 100 km"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle Okumura-Hata est conçu pour des distances de 1 km à 20 km, adaptées aux réseaux cellulaires classiques."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Formules du Modèle Hata",
                            icon: "Math",
                            body: `
## Formules du Modèle Hata

Le modèle fournit des formules spécifiques selon l’environnement pour calculer la perte de propagation $$ L $$ en décibels (dB).

### 1. Environnement Urbain
$$
L = 69.55 + 26.16 log₁₀(f) - 13.82 log₁₀(h_b) - a(h_m) + [44.9 - 6.55 log₁₀(h_b)] log₁₀(d)
$$

**Paramètres :**
- $$ L $$: perte de propagation (dB)
- $$ f $$: fréquence (MHz, 150 ≤ f ≤ 1500)
- $$ h_b $$: hauteur de la station de base (m, 30 ≤ h_b ≤ 200)
- $$ h_m $$: hauteur de l’antenne mobile (m, 1 ≤ h_m ≤ 10)
- $$ d $$: distance (km, 1 ≤ d ≤ 20)
- $$ a(h_m) $$: facteur de correction pour la hauteur mobile

#### Correction $$ a(h_m) $$
- **Ville de grande taille** :
$$
a(h_m) = 3.2 [log₁₀(11.75 h_m)]² - 4.97
$$
- **Ville moyenne ou petite** :
$$
a(h_m) = [1.1 log₁₀(f) - 0.7] h_m - [1.56 log₁₀(f) - 0.8]
$$

### 2. Environnement Suburbain
$$
L_sub = L_urb - 2 [log₁₀(f / 28)]² - 5.4
$$

### 3. Environnement Rural
$$
L_rur = L_urb - 4.78 [log₁₀(f)]² + 18.33 log₁₀(f) - 40.94
$$
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est le facteur de correction a(h_m) pour une grande ville ?",
                                        options: [
                                            "a(h_m) = [1.1 log₁₀(f) - 0.7] h_m - [1.56 log₁₀(f) - 0.8]",
                                            "a(h_m) = 3.2 [log₁₀(11.75 h_m)]² - 4.97",
                                            "a(h_m) = 2 [log₁₀(f / 28)]²",
                                            "a(h_m) = 4.78 [log₁₀(f)]²"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Dans une grande ville, a(h_m) = 3.2 [log₁₀(11.75 h_m)]² - 4.97, tenant compte de la hauteur de l’antenne mobile."
                                    },
                                    {
                                        question: "Comment calcule-t-on la perte en milieu rural ?",
                                        options: [
                                            "L_rur = L_urb - 4.78 [log₁₀(f)]² + 18.33 log₁₀(f) - 40.94",
                                            "L_rur = L_urb + 2 [log₁₀(f / 28)]²",
                                            "L_rur = L_urb - 5.4",
                                            "L_rur = L_urb + 18.33 log₁₀(f)"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "La perte en milieu rural est donnée par L_rur = L_urb - 4.78 [log₁₀(f)]² + 18.33 log₁₀(f) - 40.94 ."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Applications",
                            icon: "Network",
                            body: `
## Applications

Le modèle Okumura-Hata est un outil essentiel dans le domaine des télécommunications, avec les applications suivantes :

- **Conception et Planification des Réseaux Cellulaires** : Utilisé principalement pour les réseaux 2G et 3G.
- **Prédiction de la Couverture Radio** : Permet d’estimer la portée d’une station de base selon les paramètres environnementaux.
- **Étude d’Atténuation** : Analyse la dégradation du signal dans des environnements urbains, suburbains et ruraux.

Il reste pertinent pour les fréquences basses des réseaux modernes, bien que limité pour les fréquences supérieures à 1500 MHz ou les petites cellules.
`,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est une application clé du modèle Okumura-Hata ?",
                                        options: [
                                            "Conception de réseaux WiFi",
                                            "Planification des réseaux 2G et 3G",
                                            "Optimisation des réseaux 5G",
                                            "Gestion des communications satellite"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle est largement utilisé pour planifier les réseaux 2G et 3G dans la plage de 150 à 1500 MHz."
                                    }
                                ]
                            },
                            simulationId: simulationHata.simulationId
                        }
                    ]
                },
                channelType:"PathLoss",
            }
        });


        // Création de la simulation pour le modèle Two-Ray Ground
        const simulationTwoRayGround = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Two-Ray Ground",
                description: "Simule l'atténuation du signal radio selon le modèle Two-Ray Ground, tenant compte du trajet direct et de la réflexion sur le sol.",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 100, min: 100, max: 3000 },
                    ht: { name: "Hauteur Antenne Émettrice", value: 30, unit: "m", step: 5, min: 10, max: 100 },
                    hr: { name: "Hauteur Antenne Réceptrice", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
                    d_min: { name: "Distance Minimale", value: 1, unit: "m", step: 1, min: 1, max: 10000 },
                    d_max: { name: "Distance Maximale", value: 1000, unit: "m", step: 10, min: 1, max: 10000 }
                }),
                endPoint: "/two-ray-ground"
            }
        });
        const simulationTwoRayGroundSignal = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Two-Ray Ground",
                description: "Simule l'atténuation du signal radio selon le modèle Two-Ray Ground, tenant compte du trajet direct et de la réflexion sur le sol.",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 100, min: 100, max: 3000 },
                    ht: { name: "Hauteur Antenne Émettrice", value: 30, unit: "m", step: 5, min: 10, max: 100 },
                    hr: { name: "Hauteur Antenne Réceptrice", value: 1.5, unit: "m", step: 0.5, min: 1, max: 10 },
                    d: { name: "Distance", value: 100, unit: "m", step: 1, min: 1, max: 10000 },
                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/two-ray-ground-with-signal"
            }
        });

        // Création du cours associé avec ses chapitres
        await prisma.courses.create({
            data: {
                title: "Modèle Two-Ray Ground",
                description: "Découvrez le modèle Two-Ray Ground, un modèle de propagation qui prend en compte le trajet direct et la réflexion sur le sol.",
                icon: "Waves",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "Info",
                            body: `
## Définition

Le modèle Two-Ray Ground est un modèle de propagation radio qui considère deux trajets principaux entre l'émetteur et le récepteur : le trajet direct et le trajet réfléchi par le sol. Il est particulièrement adapté aux environnements où la réflexion sur le sol joue un rôle significatif, comme les zones rurales ou les routes avec peu d'obstacles.

Ce modèle est utilisé pour :

- **Prédire la couverture** dans les systèmes de communication sans fil.
- **Estimer la perte de propagation** pour des distances supérieures à une certaine distance critique.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est le principal phénomène pris en compte par le modèle Two-Ray Ground en plus du trajet direct ?",
                                        options: [
                                            "La diffraction",
                                            "La réflexion sur le sol",
                                            "La réfraction atmosphérique",
                                            "La diffusion"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle Two-Ray Ground prend en compte le trajet direct et le trajet réfléchi par le sol."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Formules du Modèle",
                            icon: "Math",
                            body: `
## Formules du Modèle Two-Ray Ground

La formule de la perte de propagation $$ L(d) $$ en décibels (dB) est donnée par :

$$ L(d) = 40 \\log_{10}(d) - 20 \\log_{10}(h_t h_r) $$

### Paramètres :
- $$ L(d) $$ : Perte de propagation en dB
- $$ d $$ : Distance entre l'émetteur (TX) et le récepteur (RX) en mètres
- $$ h_t $$ : Hauteur de l’antenne émettrice (station de base) en mètres
- $$ h_r $$ : Hauteur de l’antenne réceptrice (mobile) en mètres

### Distance Critique
Le modèle est valable uniquement pour des distances supérieures à la distance critique $$ d_c $$, calculée comme suit :

$$ d_c = \\frac{4 h_t h_r}{\\lambda} $$

Avec :
- $$ \\lambda = \\frac{c}{f} $$ : Longueur d’onde en mètres
- $$ c = 3 \\times 10^8 $$ : Vitesse de la lumière en m/s
- $$ f $$ : Fréquence en Hz

### Particularités :
- Pour $$ d < d_c $$, le modèle peut être imprécis.
- À grande distance, la perte augmente proportionnellement à $$ d^4 $$, contrairement à $$ d^2 $$ dans le cas de la perte en espace libre.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est la formule de la perte de propagation dans le modèle Two-Ray Ground ?",
                                        options: [
                                            "L(d) = 20 \\log_{10}(d) + 20 \\log_{10}(f) + 32.44",
                                            "L(d) = 40 \\log_{10}(d) - 20 \\log_{10}(h_t h_r)",
                                            "L(d) = 69.55 + 26.16 \\log_{10}(f) - 13.82 \\log_{10}(h_b)",
                                            "L(d) = 10 n \\log_{10}(d) + C"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "La formule correcte est L(d) = 40 \\log_{10}(d) - 20 \\log_{10}(h_t h_r) ."
                                    },
                                    {
                                        question: "Que se passe-t-il pour les distances inférieures à la distance critique d_c ?",
                                        options: [
                                            "Le modèle est plus précis",
                                            "Le modèle peut être imprécis",
                                            "La perte devient constante",
                                            "La réflexion sur le sol disparaît"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Pour d < d_c , le modèle Two-Ray Ground peut ne pas être précis."
                                    }
                                ]
                            },
                            simulationId: simulationTwoRayGround.simulationId
                        },
                        {
                            name: "Applications",
                            icon: "Network",
                            body: `
## Applications

Le modèle Two-Ray Ground est utilisé dans plusieurs contextes pratiques :

- **Planification des réseaux sans fil** : Pour estimer la couverture et la qualité du signal dans des zones où la réflexion sur le sol est dominante.
- **Communications mobiles** : Particulièrement dans les environnements ruraux ou sur les routes avec peu d’obstacles.
- **Études de propagation** : Pour analyser l’impact des réflexions sur la propagation des ondes radio.

Il est surtout efficace lorsque la longueur d’onde est comparable aux hauteurs des antennes et pour des distances dépassant la distance critique.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Dans quel type d’environnement le modèle Two-Ray Ground est-il le plus adapté ?",
                                        options: [
                                            "Urbain dense",
                                            "Suburbain",
                                            "Rural ou sur les routes",
                                            "Intérieur des bâtiments"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "Le modèle est particulièrement utile dans les environnements ruraux ou sur les routes où la réflexion sur le sol est significative."
                                    }
                                ]
                            },
                            simulationId: simulationTwoRayGroundSignal.simulationId
                        }
                    ]
                },
                channelType:"Multipath",
            }
        });


        // Création de la simulation pour le modèle Weissberger
        const simulationWeissberger = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Weissberger",
                description: "Simule l'atténuation du signal radio due à la végétation en utilisant le modèle Weissberger",
                params: JSON.stringify({
                    f: { name: "Fréquence", value: 230, unit: "MHz", step: 10, min: 230, max: 950 },
                    d_v: { name: "Épaisseur de Végétation", value: 10, unit: "m", step: 1, min: 0, max: 400 }
                }),
                endPoint: "/weissberger"
            }
        });

        const simulationWeissbergerSignal = await prisma.simulation.create({
            data: {
                name: "Simulation de Signal avec Modèle Weissberger",
                description: "Simule l'atténuation du signal radio à travers la végétation en utilisant le modèle Weissberger",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 10, min: 230, max: 950 },
                    foliage_depth_km: { name: "Profondeur de Végétation", value: 0.1, unit: "km", step: 0.1, min: 0, max: 0.4 },
                    d_min: { name: "Distance Minimale", value: 1, unit: "km", step: 1, min: 1, max: 1000 },
                    d_max: { name: "Distance Maximale", value: 1000, unit: "km", step: 10, min: 1, max: 10000 },
                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/weissberger-signal-simulation"
            }
        });

        // Create the associated course with chapters            
        await prisma.courses.create({
            data: {
                title: "Modèle Weissberger",
                description: "Apprenez-en davantage sur le modèle Weissberger, un modèle empirique pour estimer l'atténuation du signal radio due à la végétation.",
                icon: "Leaf",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "Info",
                            body: `
## Définition

Le modèle Weissberger est un modèle empirique utilisé pour estimer l'atténuation des signaux radio causée par la végétation, comme les arbres ou les buissons. Il est particulièrement utile dans les scénarios où la végétation obstrue le trajet direct entre un émetteur et un récepteur, comme dans les zones forestières ou rurales.

### Conditions de validité :
- **Fréquence $$ f $$** : 230 MHz à 950 MHz
- **Épaisseur de végétation $$ d_v $$** : 0 m à 400 m
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est l'objectif principal du modèle Weissberger ?",
                                        options: [
                                            "Mesurer la puissance du signal en zone urbaine",
                                            "Estimer l'atténuation due à la végétation",
                                            "Calculer la réflexion du signal dans les bâtiments",
                                            "Déterminer les effets de la hauteur d'antenne"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle Weissberger est conçu pour estimer l'atténuation du signal radio causée par la végétation."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Formules",
                            icon: "Math",
                            body: `
## Formules du modèle Weissberger

L'atténuation $$ L_v $$ (en dB) est calculée en fonction de la fréquence $$ f $$ (en MHz) et de l'épaisseur de végétation $$ d_v $$ (en mètres). L'équation varie selon $$ d_v $$ :

$$
L_v = 
\\begin{cases} 
0.45 f^{0.284} d_v & \\text{si } 0 < d_v \\leq 14 \\\\
1.33 f^{0.284} d_v^{0.588} & \\text{si } 14 < d_v \\leq 400 
\\end{cases}
$$

### Paramètres :
- $$ L_v $$ : Atténuation due à la végétation (dB)
- $$ f $$ : Fréquence (MHz), où 230 ≤ $$ f $$ ≤ 950
- $$ d_v $$ : Épaisseur de végétation (m), où 0 < $$ d_v $$ ≤ 400

### Notes :
- Pour $$ d_v $$ jusqu'à 14 mètres, l'atténuation croît linéairement avec $$ d_v $$.
- Au-delà de 14 mètres, l'atténuation augmente avec une puissance de 0.588 sur $$ d_v $$, reflétant les effets d'une végétation plus dense.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle est la formule pour $$ L_v $$ quand $$ d_v $$ vaut 10 mètres ?",
                                        options: [
                                            "1.33 f^{0.284} d_v^{0.588}",
                                            "0.45 f^{0.284} d_v",
                                            "1.33 f^{0.284} d_v",
                                            "0.45 f^{0.588} d_v"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Pour $$ 0 < d_v \\leq 14 $$ m, la formule est $$ L_v = 0.45 f^{0.284} d_v $$."
                                    }
                                ]
                            },
                            simulationId: simulationWeissberger.simulationId
                        },
                        {
                            name: "Applications",
                            icon: "Network",
                            body: `
## Applications

Le modèle Weissberger est largement utilisé dans les scénarios impliquant de la végétation, notamment :

- **Planification de réseaux sans fil** : Estimation de la perte de signal dans les zones forestières ou rurales.
- **Communications mobiles** : Évaluation de la qualité du signal dans des environnements avec arbres ou buissons.
- **Études de propagation** : Analyse de l'impact de la végétation sur la propagation des ondes radio.

Ce modèle est particulièrement pertinent pour les fréquences UHF (230-950 MHz) et des épaisseurs de végétation allant jusqu'à 400 mètres.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Dans quel scénario le modèle Weissberger est-il le plus applicable ?",
                                        options: [
                                            "Réseaux Wi-Fi intérieurs",
                                            "Zones urbaines avec gratte-ciels",
                                            "Régions rurales boisées",
                                            "Communications sous-marines"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "Le modèle est adapté aux environnements avec végétation, comme les régions rurales boisées."
                                    }
                                ]
                            },
                            simulationId: simulationWeissbergerSignal.simulationId
                        }
                    ]
                },
                channelType:"PathLoss",
            }
        });



        // Création de la simulation pour le modèle Longley-Rice
        const simulationLongleyRice = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Longley-Rice",
                description: "Simule l'atténuation du signal radio selon le modèle Longley-Rice, en tenant compte de la topographie et des paramètres environnementaux.",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 10, min: 230, max: 950 },
                    height_tx: { name: "Hauteur émetteur", value: 30, unit: "m", step: 1, min: 10, max: 300 },
                    height_rx: { name: "Hauteur récepteur", value: 1.5, unit: "m", step: 0.1, min: 1, max: 10 },
                    terrain_irregularity: { name: "Irregularité terrain", value: 50, unit: "m", step: 5, min: 0, max: 500 },
                    climate: {
                        name: "Climat",
                        value: "Tempéré continental",
                        options: ["Tempéré maritime", "Tempéré continental"]
                    },
                    num_points: { name: "Points simulation", value: 300, unit: "", step: 50, min: 100, max: 1000 }
                }),
                endPoint: "/longley-rice-loss-simulation"
            }
        });
        const simulationLongleyRiceSignal = await prisma.simulation.create({
            data: {
                name: "Simulation du Modèle Longley-Rice",
                description: "Simule l'atténuation du signal radio selon le modèle Longley-Rice, en tenant compte de la topographie et des paramètres environnementaux.",
                params: JSON.stringify({
                    frequency_MHz: { name: "Fréquence", value: 900, unit: "MHz", step: 10, min: 230, max: 950 },
                    height_tx: { name: "Hauteur émetteur", value: 30, unit: "m", step: 1, min: 10, max: 300 },
                    height_rx: { name: "Hauteur récepteur", value: 1.5, unit: "m", step: 0.1, min: 1, max: 10 },
                    d_min: { name: "Distance minimale", value: 1, unit: "km", step: 1, min: 1, max: 100 },
                    d_max: { name: "Distance maximale", value: 1000, unit: "km", step: 10, min: 10, max: 10000 },
                    terrain_irregularity: { name: "Irregularité du terrain", value: 50, unit: "m", step: 5, min: 0, max: 500 },
                    climate: {
                        name: "Climat",
                        value: "Tempéré continental",
                        options: ["Tempéré maritime", "Tempéré continental"]
                    },
                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/longley-rice-signal-simulation"
            }
        });

        // Création du cours associé avec ses chapitres
        await prisma.courses.create({
            data: {
                title: "Modèle Longley-Rice",
                description: "Découvrez le modèle Longley-Rice, un modèle semi-empirique pour estimer l'atténuation des signaux radio en fonction de la topographie et des conditions environnementales.",
                icon: "Mountain",
                chapters: {
                    create: [
                        {
                            name: "Définition",
                            icon: "Info",
                            body: `
## Définition

Le modèle Longley-Rice est un modèle de propagation radio semi-empirique utilisé pour prédire l'atténuation du signal dans des environnements variés, notamment en tenant compte de la topographie du terrain. Il est particulièrement adapté aux fréquences VHF et UHF et est largement utilisé pour la planification des réseaux de diffusion et de communication.

### Conditions de Validité :
- **Fréquence** : 20 MHz à 20 GHz
- **Distance** : Jusqu'à 2000 km
- **Type de Terrain** : Plat, vallonné, montagneux

Le modèle prend en compte des paramètres tels que la hauteur des antennes, la fréquence, la distance, et le type de terrain pour fournir une estimation précise de la couverture radio.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est le principal avantage du modèle Longley-Rice ?",
                                        options: [
                                            "Il est simple à calculer",
                                            "Il prend en compte la topographie du terrain",
                                            "Il est uniquement pour les environnements urbains",
                                            "Il ne nécessite pas de données de terrain"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle Longley-Rice est apprécié pour sa capacité à prendre en compte la topographie du terrain, ce qui le rend plus précis dans des environnements variés."
                                    }
                                ]
                            },
                        },
                        {
                            name: "Paramètres et Calculs",
                            icon: "Math",
                            body: `
## Paramètres et Calculs

Le modèle Longley-Rice ne se résume pas à une simple formule, mais à un ensemble de calculs complexes qui intègrent plusieurs paramètres :

- **Fréquence $$ f $$**: en MHz
- **Hauteur de l'antenne émettrice $$ h_t $$**: en mètres
- **Hauteur de l'antenne réceptrice $$ h_r $$**: en mètres
- **Distance $$ d $$**: en km
- **Type de terrain**: plat, vallonné, montagneux
- **Variabilité temporelle et spatiale**

### Modes de Propagation :
Le modèle considère trois modes principaux :
1. **Ligne de mire (LOS)** : Lorsque l'émetteur et le récepteur sont en vue directe.
2. **Diffraction** : Lorsque le signal est obstrué par des obstacles comme des collines.
3. **Diffusion troposphérique** : Pour les grandes distances où le signal est dispersé par l'atmosphère.

### Calcul de l'Atténuation :
L'atténuation est calculée en fonction des conditions spécifiques, et le modèle fournit des valeurs de perte de propagation en dB, tenant compte des effets du terrain et de l'environnement.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel paramètre n'est PAS pris en compte par le modèle Longley-Rice ?",
                                        options: [
                                            "Fréquence",
                                            "Hauteur des antennes",
                                            "Type de modulation",
                                            "Type de terrain"
                                        ],
                                        correctAnswerIndex: 2,
                                        explaination: "Le modèle Longley-Rice ne prend pas en compte le type de modulation, mais se concentre sur les aspects de propagation physique."
                                    }
                                ]
                            },
                            simulationId: simulationLongleyRice.simulationId
                        },
                        {
                            name: "Applications",
                            icon: "Network",
                            body: `
## Applications

Le modèle Longley-Rice est utilisé dans divers contextes pratiques :

- **Planification des Réseaux de Diffusion** : Pour estimer la couverture des stations de radio et de télévision.
- **Communications Militaires** : Pour prédire la portée des communications dans des terrains variés.
- **Études de Propagation** : Pour analyser l'impact de la topographie sur la propagation des ondes radio.

Il est particulièrement utile dans les environnements où la topographie joue un rôle crucial, comme les zones montagneuses ou vallonnées.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Dans quel type d'environnement le modèle Longley-Rice est-il particulièrement utile ?",
                                        options: [
                                            "Environnements urbains denses",
                                            "Zones montagneuses",
                                            "Intérieurs de bâtiments",
                                            "Sous l'eau"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle est particulièrement utile dans les zones montagneuses ou vallonnées où la topographie affecte significativement la propagation."
                                    }
                                ]
                            },
                            simulationId: simulationLongleyRiceSignal.simulationId
                        }
                    ]
                },
                channelType:"PathLoss",
            }
        });

        const simulationOFDM = await prisma.simulation.create({
            data: {
                name: "Simulation du modèle OFDM",
                description: "Simule le modèle OFDM pour la transmission de données à haute vitesse sur des canaux bruités.",
                params: JSON.stringify({
                    fftlen: { name: "Taille FFT", value: 64, unit: "", step: 16, min: 16, max: 1024 },
                    gilen: { name: "Longueur du préfixe cyclique", value: 16, unit: "", step: 1, min: 0, max: 256 },
                    data_sc: { name: "Sous-porteuses de données", value: 48, unit: "", step: 1, min: 1, max: 1024 },
                    esn0: { name: "Es/N0", value: 10, unit: "dB", step: 1, min: -10, max: 30 },
                    showAtten: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    frequency_MHz: { name: "Fréquence du signal", value: 1, unit: "MHz", step: 1, min: 1, max: 10 },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/ofdm"
            }
        });

        await prisma.courses.create({
            data: {
                title: "Modèle OFDM",
                description: "Apprenez le modèle OFDM, une technique clé pour la transmission de données à haute vitesse sur des canaux dégradés.",
                icon: "Waveform",
                chapters: {
                    create: [
                        {
                            name: "Introduction à l'OFDM",
                            icon: "Info",
                            body: `
## Introduction à l'OFDM

**Le multiplexage par répartition orthogonale de la fréquence (OFDM)** est une technique de modulation multi-porteuses conçue pour transmettre des données à haute vitesse sur des canaux affectés par du bruit, des évanouissements ou des interférences entre symboles (ISI). Il répartit les données sur plusieurs sous-porteuses orthogonales, ajoute un préfixe cyclique pour lutter contre l'ISI et utilise la IFFT/FFT pour la modulation et la démodulation. Les performances sont mesurées à l'aide de métriques comme le taux d'erreur binaire (BER) et le taux d'erreur de paquets (PER).

### Objectifs de l'OFDM
- Permettre une transmission à haute vitesse dans des environnements difficiles.
- Minimiser les interférences grâce à des sous-porteuses orthogonales.
- Évaluer les performances avec les métriques BER et PER.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est l'objectif principal de l'OFDM ?",
                                        options: [
                                            "Réduire la taille de l'antenne",
                                            "Transmettre des données à haute vitesse sur des canaux dégradés",
                                            "Augmenter la puissance du signal",
                                            "Simplifier le matériel"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "L'OFDM est conçu pour gérer les canaux dégradés en répartissant les données sur des sous-porteuses orthogonales."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Concepts clés de l'OFDM",
                            icon: "Key",
                            body: `
## Concepts clés de l'OFDM

L'OFDM repose sur plusieurs principes fondamentaux pour une transmission efficace :

### Modulation multi-porteuses
Les données sont divisées et envoyées sur plusieurs sous-porteuses à différentes fréquences. Chaque sous-porteuse est modulée indépendamment, améliorant la résilience aux perturbations du canal.

### Orthogonalité
Les sous-porteuses sont orthogonales, ce qui signifie qu'elles n'interfèrent pas entre elles. Cela maximise l'efficacité spectrale en évitant le chevauchement des fréquences.

### Préfixe cyclique
Un préfixe cyclique est ajouté à chaque symbole OFDM pour éviter les **interférences entre symboles (ISI)**. Il agit comme un intervalle de garde contre la dispersion temporelle du canal.

### IFFT et FFT
- **IFFT (Transformée de Fourier Inverse Rapide)** : Utilisée à l'émetteur pour moduler les données sur les sous-porteuses.
- **FFT (Transformée de Fourier Rapide)** : Utilisée au récepteur pour démoduler les données.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que permet d'éviter le préfixe cyclique ?",
                                        options: [
                                            "L'amplification du signal",
                                            "Les interférences entre symboles (ISI)",
                                            "La dérive en fréquence",
                                            "L'augmentation du bruit"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le préfixe cyclique atténue l'ISI en protégeant contre les retards de propagation."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Atténuation du bruit en OFDM",
                            icon: "Calculator",
                            body: `
## Atténuation du bruit en OFDM

Comprendre le bruit est essentiel pour évaluer les performances de l'OFDM. L'atténuation due au bruit peut être modélisée avec la formule suivante, adaptée pour une interprétation physique :

$$
\\mathrm{Atténuation} = \\sqrt{0.5 \\cdot \\mathrm{moyenne}\\left(|\\mathrm{canal}|^2\\right) \\cdot \\frac{\\mathrm{LongueurFFT}}{\\mathrm{DonneesSC}} \\cdot \\frac{\\mathrm{LongueurFFT}}{\\mathrm{LongueurFFT} + \\mathrm{LongueurGI}} \\cdot 10^{-\\frac{\\mathrm{EsN0}}{10}}}
$$


### Détail de la formule
- **$$ \\text{moyenne}(|\\text{canal}|^2) $$** : Puissance moyenne du signal OFDM, dérivée de la réponse du canal.
- **LongueurFFT** : Taille FFT, représentant le nombre total de sous-porteuses.
- **DonneesSC** : Nombre de sous-porteuses transportant des données (hors pilotes ou bandes de garde).
- **LongueurGI** : Longueur du préfixe cyclique ajouté à chaque symbole.
- **EsN0** : Rapport signal-sur-bruit par symbole (Es/N0) en décibels.
- **0.5** : Facteur d'échelle pour un bruit complexe avec des composantes réelles et imaginaires.
- **$$ 10^{-\\frac{\\text{esn0}}{10}} $$** : Convertit Es/N0 de dB à une échelle linéaire pour ajuster l'amplitude du bruit.

Cette formule calcule l'atténuation induite par le bruit en tenant compte de la puissance du signal, de l'allocation des sous-porteuses, de la surcharge du préfixe cyclique et du rapport signal-sur-bruit.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Que représente $$mean(|chh|²)$$ dans la formule du bruit ?",
                                        options: [
                                            "La taille FFT",
                                            "La puissance moyenne du signal",
                                            "L'amplitude du bruit",
                                            "La longueur du préfixe cyclique"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Elle représente la puissance moyenne du signal OFDM basée sur la réponse du canal."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Applications de l'OFDM",
                            icon: "Applications",
                            body: `
## Applications de l'OFDM

La robustesse et l'efficacité de l'OFDM en font une pierre angulaire des systèmes de communication modernes.

### Exemples
- **4G LTE et 5G** : Transmission de données mobiles à haute vitesse.
- **WiFi (802.11a/g/n/ac/ax)** : Connectivité sans fil rapide.
- **DVB-T** : Diffusion télévisuelle numérique terrestre.
- **ADSL/VDSL** : Haut débit sur lignes téléphoniques.

### Avantages
- Résilience aux évanouissements sélectifs grâce aux sous-porteuses.
- Haute efficacité spectrale.
- Implémentation simplifiée avec FFT/IFFT.
                            `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quelle technologie utilise l'OFDM pour les données mobiles ?",
                                        options: [
                                            "Bluetooth",
                                            "4G LTE",
                                            "Radio FM",
                                            "USB"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "L'OFDM est fondamental pour les réseaux mobiles 4G LTE et 5G."
                                    }
                                ]
                            },
                            simulationId: simulationOFDM.simulationId
                        }
                    ]
                },
                channelType:"Modulation",
            }
        });


        // Create the course with nested chapters and nested quizzes.
        const simulationCost = await prisma.simulation.create({
            data: {
                name: "Paramètres du Modèle",
                description: "Simule l'équation du modèle COST 231 pour l'atténuation du signal.",
                params: JSON.stringify({
                    f: { name: "Fréquence", value: 900, unit: "MHz", step: 100, min: 800, max: 2000 },
                    h_bs: { name: "Hauteur de la Station de Base", value: 30, unit: "m", step: 5, min: 10, max: 100 },
                    h_ms: { name: "Hauteur du Récepteur Mobile", value: 1.5, unit: "m", step: 0.5, min: 1, max: 3 },
                    d: { name: "Distance", value: 1, unit: "m", step: 1, min: 1, max: 20, convertedToMili: true },
                    environment: { name: "Environnement", value: "rural", options: ["urban", "suburban", "rural"] },
                    apply_fading: { name: "Appliquer l'Évanouissement", value: "Non", options: ["Oui", "Non"] },

                    showLoss: { name: "Afficher l'atténuation", value: "Oui", options: ["Oui", "Non"] },
                    duration: { name: "Durée", value: 1.0, unit: "s", step: 0.1, min: 0.1, max: 10 },
                    sampling_interval: { name: "Intervalle d'échantillonnage", value: 1, unit: "ms", step: 1, min: 1, max: 100, convertedToMili: true },
                    showDomain: { name: "Domaine de la fichage", value: "domaine fréquentiel", options: ["domaine fréquentiel", "domaine temporel"] },
                }),
                endPoint: "/Cost231/fading"
            }
        });

        await prisma.courses.create({
            data: {
                title: "Modèle COST 231",
                description: "Découvrez le modèle de propagation COST 231 utilisé pour la prédiction du signal en environnements urbain, suburbain et rural.",
                icon: "RadioTower",
                chapters: {
                    create: [
                        {
                            name: "Introduction COST 231",
                            icon: "BookOpen",
                            body: `
## Introduction au Modèle COST 231

Le modèle COST 231, également connu sous le nom d'extension Hata pour PCS, est un modèle de propagation radio conçu pour prédire l'atténuation des signaux dans les bandes de fréquences de 800 MHz à 2000 MHz. Développé comme une amélioration du modèle Hata, il est particulièrement adapté aux réseaux cellulaires 2G, 3G et 4G, couvrant les environnements urbains, suburbains et ruraux.

### Historique et Contexte
Issu du projet européen COST 231 (1986-1996), ce modèle a été créé pour répondre aux besoins croissants de précision dans la planification des réseaux mobiles, notamment dans les zones urbaines avec des bâtiments élevés. Il s'appuie sur les travaux d'Okumura et Hata, adaptés pour les fréquences plus élevées utilisées dans les systèmes cellulaires modernes de l'époque.

### Applications en Télécommunications
Le modèle COST 231 est largement utilisé pour :
- **Estimer la couverture réseau** : Prédire la portée des signaux pour une planification efficace.
- **Optimiser le placement des antennes** : Assurer une couverture maximale avec un minimum d'interférences.
- **Améliorer la qualité du service** : Ajuster les paramètres pour répondre aux besoins des utilisateurs dans divers environnements.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel est le principal objectif du modèle COST 231 ?",
                                        options: [
                                            "Prédire l'atténuation du signal en environnements variés",
                                            "Augmenter la vitesse des réseaux 5G",
                                            "Optimiser la consommation d'énergie des antennes",
                                            "Améliorer la sécurité des communications mobiles"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "Le modèle COST 231 est conçu pour prédire l'atténuation du signal dans des environnements urbains, suburbains et ruraux afin d'améliorer la planification des réseaux cellulaires."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Paramètres du Modèle",
                            icon: "Sliders",
                            body: `
## Paramètres du Modèle

Le modèle COST 231 repose sur une équation empirique qui calcule l'atténuation des ondes radio en fonction de plusieurs paramètres clés, adaptée aux environnements urbains, suburbains et ruraux.

### Formule Générale (Urbain)
L'atténuation $$ L $$ en décibels (dB) pour les zones urbaines est donnée par :

$$
L = 46.3 + 33.9 log₁₀(f) - 13.82 log₁₀(h_BS) - a(h_MS) + [44.9 - 6.55 log₁₀(h_BS)] log₁₀(d) + C_m
$$

où :
- $$ f $$ : fréquence (MHz, entre 800 et 2000)
- $$ h_BS $$ : hauteur de l’antenne de la station de base (m)
- $$ h_MS $$ : hauteur du récepteur mobile (m)
- $$ d $$ : distance entre l'émetteur et le récepteur (km)
- $$ a(h_MS) $$ : facteur de correction pour la hauteur du mobile
- $$ C_m $$ : correction environnementale (0 dB pour villes moyennes/suburbain, 3 dB pour métropoles)

#### Correction $$ a(h_MS) $$ pour Urbain
Pour $$ f > 200 $$ MHz :
$$
a(h_MS) = 3.2 [log₁₀(11.75 h_MS)]² - 4.97
$$

#### Ajustements pour Suburban et Rural
- **Suburbain** : $$ L_{suburban} = L_{urban} - 2 [log₁₀(f/28)]² - 5.4 $$
- **Rural** : $$ L_{rural} = L_{urban} - 4.78 [log₁₀(f)]² + 18.33 log₁₀(f) - 40.94 $$

### Facteurs d’Influence
- **Urbain** : Forte atténuation due à la densité des bâtiments et aux réflexions multiples.
- **Suburbain** : Atténuation modérée avec moins d’obstacles, mais toujours influencée par des structures.
- **Rural** : Atténuation minimale grâce à des espaces ouverts et peu d’obstacles élevés.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Dans quelle plage de fréquences le modèle COST 231 est-il applicable ?",
                                        options: [
                                            "300 MHz - 800 MHz",
                                            "800 MHz - 2000 MHz",
                                            "2 GHz - 6 GHz",
                                            "Au-delà de 6 GHz"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Le modèle COST 231 est conçu pour fonctionner dans la plage de fréquences de 800 MHz à 2000 MHz, ce qui couvre les technologies mobiles comme la 2G, 3G et début 4G."
                                    }
                                ]
                            }
                        },
                        {
                            name: "Applications Pratiques",
                            icon: "BarChart",
                            body: `
## Applications Pratiques

Le modèle COST 231 joue un rôle clé dans la conception et l’optimisation des réseaux mobiles, offrant des outils pour améliorer la couverture et la performance.

### Optimisation des Réseaux
- **Placement des Antennes** : Détermine les emplacements optimaux pour maximiser la couverture et réduire les zones mortes.
- **Réglage de la Puissance** : Ajuste la puissance des stations de base pour minimiser les interférences tout en maintenant la qualité du signal.

### Simulation de Couverture
Les ingénieurs utilisent des logiciels intégrant le modèle COST 231 pour simuler la propagation des ondes radio, visualisant ainsi la couverture réseau avant le déploiement physique des infrastructures.

### Pertinence pour les Réseaux Modernes
Bien que conçu pour les réseaux 2G et 3G, le modèle reste pertinent pour :
- **4G** : Utilisé dans les bandes basses fréquences (ex. 800 MHz, 1800 MHz).
- **5G Sub-6 GHz** : Applicable après calibration pour les fréquences inférieures à 6 GHz.
- **Limites** : Moins adapté aux ondes millimétriques (mmWave) de la 5G, où d'autres modèles sont préférés en raison des caractéristiques de propagation différentes.
                    `,
                            quizes: {
                                create: [
                                    {
                                        question: "Quel paramètre influence le plus la propagation des ondes dans un environnement urbain ?",
                                        options: [
                                            "La hauteur des antennes",
                                            "La densité des bâtiments",
                                            "La température de l'air",
                                            "L'humidité de l'atmosphère"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Dans un environnement urbain, la densité et la hauteur des bâtiments influencent fortement la propagation des ondes radio en créant des réflexions et des atténuations."
                                    },
                                    {
                                        question: "Quelle est l’unité de la distance \\$$ d \\$$ dans l’équation de COST 231 ?",
                                        options: [
                                            "Kilomètres (km)",
                                            "Mètres (m)",
                                            "Décibels (dB)",
                                            "Gigahertz (GHz)"
                                        ],
                                        correctAnswerIndex: 0,
                                        explaination: "Dans l'équation de COST 231, la distance \\$$ d \\$$ entre l'émetteur et le récepteur est exprimée en kilomètres (km)."
                                    },
                                    {
                                        question: "Pourquoi le modèle COST 231 est-il encore pertinent aujourd’hui ?",
                                        options: [
                                            "Il est utilisé pour les prévisions de signal dans les réseaux 5G millimétriques",
                                            "Il est encore appliqué dans certaines bandes de fréquences pour la 4G et l’optimisation des réseaux",
                                            "Il est utilisé uniquement pour les réseaux 2G",
                                            "Il a été remplacé par des modèles plus modernes et n'est plus utilisé"
                                        ],
                                        correctAnswerIndex: 1,
                                        explaination: "Bien que le modèle COST 231 ait été conçu pour les réseaux mobiles 2G et 3G, il est encore utilisé dans certaines bandes de fréquences pour la 4G et pour l’optimisation des réseaux."
                                    }
                                ]
                            },
                            simulationId: simulationCost.simulationId
                        }
                    ]
                },
                channelType:"PathLoss",
            }
        });


        return NextResponse.json({
            success: "Données insérées avec succès !"
        });

    } catch (error) {
        return NextResponse.json({
            failed: "Erreur lors de l'insertion des données :" + error
        });
    }

}