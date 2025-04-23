'use client'
import React, { useActionState } from 'react';
import { createScenario } from '../lib/action';

export default function ScenarioForm() {

    const initialState = {
        message: '',
        errors: {},
        fields: {}
    };   

    const [state, formAction] = useActionState(createScenario, initialState);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create New Scenario</h1>

            <form action={formAction} className="space-y-6">
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Scenario Details</h2>

                    <div className="flex flex-col">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1">
                            Title*
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Title"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 mb-1">
                            Image URL*
                        </label>
                        <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">
                            Description*
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter scenario description..."
                        ></textarea>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Scenario Content</h2>

                    <div className="flex flex-col">
                        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 mb-1">
                            Scenario Title
                        </label>
                        <input
                            type="text"
                            id="scenarioTitle"
                            name="scenarioTitle"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Title"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 mb-1">
                            Image URL Scenario
                        </label>
                        <input
                            type="text"
                            id="imageUrlScenario"
                            name="imageUrlScenario"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>



                    <div className="flex flex-col">
                        <label htmlFor="body" className="text-sm font-medium text-gray-700 mb-1">
                            Body*
                        </label>
                        <textarea
                            id="body"
                            name="body"
                            rows={6}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter detailed scenario content..."
                        ></textarea>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Save Scenario
                    </button>
                </div>
                {state.message && <p>{state.message}</p>}
            </form>
        </div>
    );
}