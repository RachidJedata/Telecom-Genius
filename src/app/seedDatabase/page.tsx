'use client'
import React, { useState } from 'react';

export default function ScenarioForm() {
    const [formData, setFormData] = useState({
        imageUrl: '',
        description: '',
        body: '',
        title: '',
        scenarioTitle: '',
        imageUrlScenario: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/scenarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Scenario saved successfully!');
                // Reset form or redirect
            } else {
                alert('Failed to save scenario');
            }
        } catch (error) {
            console.error('Error saving scenario:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create New Scenario</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                            value={formData.title}
                            onChange={handleChange}
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
                            value={formData.imageUrl}
                            onChange={handleChange}
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
                            value={formData.description}
                            onChange={handleChange}
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
                            value={formData.scenarioTitle}
                            onChange={handleChange}
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
                            value={formData.imageUrlScenario}
                            onChange={handleChange}
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
                            value={formData.body}
                            onChange={handleChange}
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
            </form>
        </div>
    );
}