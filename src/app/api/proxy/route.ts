import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const targetUrl = `${process.env.PYTHON_END_POINT}/${searchParams.get('path')}?${searchParams.toString().replace(`path=${searchParams.get('path')}&`, '')}`;

    const response = await fetch(targetUrl, {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'MyApp/1.0',
        },
    });

    const data = await response.json();
    return NextResponse.json(data);
}