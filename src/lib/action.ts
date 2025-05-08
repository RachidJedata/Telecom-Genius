'use server'

import { Chapters, ModelType, Prisma } from "@prisma/client";
import prisma from "./prisma";
import bcrypt from 'bcryptjs';
import { FormState } from "./utils";

export async function saveUser(data: Prisma.UserCreateInput) {
    try {
        console.log(data);
        // Check if the user already exists
        const ifExists = await prisma.user.count({
            where: { email: data.email }
        });

        if (ifExists > 0) {
            // console.log(`User with ID ${user.user_id} already exists.`);
            return { success: 0, errorMessage: "a user with the same email already exist" };
        }

        const defaultPhoto = ((process.env.NEXTAUTH_URL || '') + "/avatars/default.svg");
        const hashedPassword = await bcrypt.hash(data.password!, 10);
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                avatar: defaultPhoto,
            }
        });

        return { success: 1 };
    } catch (error) {
        console.log(error);
        return { success: 0, errorMessage: "Failed to sign up please try again!" };
    }
}

export async function getCourses(limit: number, offset: number = 0, channelType: String = "") {
    const includes = Object.values(ModelType).includes(channelType as ModelType);

    return await prisma.courses.findMany({
        take: limit,
        skip: offset,
        orderBy: { dateAdded: 'desc' }, // Explicit sorting order
        ...(
            includes && {
                where: {
                    channelType: channelType as ModelType
                }
            }
        )
    });
}

export async function getCourse(slug: string) {
    const pattern = `%${slug}%`;

    return await prisma.$queryRaw<(Chapters & { title: string })[]>`
      SELECT p.*, c.title
      FROM "Chapters" p
      JOIN "Courses" c  ON c."courseId" = p."courseId"
      JOIN course_with_slug s ON s."courseId" = p."courseId"
      WHERE s.slug LIKE ${pattern}
      ORDER BY p."dateAdded" DESC
    `;
}


export async function fetchCoursesPages(channelType: String = "") {
    const includes = Object.values(ModelType).includes(channelType as ModelType);
    return await prisma.courses.count({
        ...(
            includes && {
                where: {
                    channelType: channelType as ModelType
                }
            }
        )
    })
}


export async function getSimulation(simulationId: number | null) {
    if (!simulationId) return null;
    return await prisma.simulation.findUnique({
        where: {
            simulationId: simulationId
        }
    });
}

export async function saveSimulationParameters(simulationId: number | null, params: any) {
    if (!simulationId) return;
    await prisma.simulation.update({
        data: {
            savedParams: params ? JSON.stringify(params) : null
        },
        where: {
            simulationId: simulationId
        }
    })
}

export async function getQuiz(chapterId: string) {
    return await prisma.quizes.findMany({
        where: {
            chapters: {
                some: {
                    chapterId: chapterId,
                },
            },
        },
    });
}

export async function createScenario(prevState: FormState, formData: FormData) {

    const imageUrl = formData.get('imageUrl')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const title = formData.get('title')?.toString() || '';


    const scenarioTitle = formData.get('scenarioTitle')?.toString() || '';
    const imageUrlScenario = formData.get('imageUrlScenario')?.toString() || '';
    const body = formData.get('body')?.toString() || '';


    await prisma.environmentScenarios.create({
        data: {
            title: title,
            imageUrl: imageUrl,
            description: description,
            Envdetails: {
                create: {
                    title: scenarioTitle,
                    imageUrl: imageUrlScenario,
                    body: body,
                }
            }
        }
    });


    // Return success state
    return {
        message: 'Scenario created successfully! ' + imageUrl,
    };

}

export async function getScenarios() {
    return await prisma.environmentScenarios.findMany();
}

export async function getScenarioDetails(scenarioId: string) {
    return await prisma.environmentDetails.findUnique({
        where: {
            envDetailsId: scenarioId
        },
        include: {
            SuggestedScenarios: true
        }
    })
}