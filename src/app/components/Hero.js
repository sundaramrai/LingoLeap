import React from 'react'
import Image from 'next/image'

const Hero = () => {
    return (
        <div>
            <div className="bg-white pl-64 my-10 pb-6 sm:pb-4 lg:pb-4">
                <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
                    <section className="mb-8 flex flex-col justify-between gap-6 sm:gap-10 md:mb-16 md:gap-16 lg:flex-row">
                        {/* content - start */}
                        <div className="flex flex-col justify-center sm:text-center lg:py-12 lg:text-left xl:w-5/12">

                            <p className=" font-semibold text-red-500 text-3xl mb-4">Welcome to</p>
                            <a href="/" className="mb-8 inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl" aria-label="logo">
                                <img src='/lingoleap.png' style={{ width: '80px', height: '80px' }} alt="LingoLeap Logo" />
                                <h1 className="text-8xl">  LingoLeap </h1>
                            </a>

                            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
                                <a href="/signup" className="inline-block rounded-lg bg-red-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-red-300 transition duration-100 hover:bg-red-600 focus-visible:ring active:bg-red-700 md:text-base mt-4">Start now</a>

                                <a href="/profile" className="inline-block rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-red-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base mt-4">See profile</a>
                            </div>
                        </div>
                        {/* content - end */}

                        {/* image - start */}
                        <Image
                            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/social-proof/table-professor.svg"
                            alt="Professor at table illustration"
                            width={500}
                            height={400}
                            className="h-full w-full object-cover object-center"
                            priority={false}
                        />
                        {/* image - end */}
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Hero
