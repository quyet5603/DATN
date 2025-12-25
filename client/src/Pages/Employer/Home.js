import React, { useEffect, useState } from 'react'
import { Hero } from '../../components/Home/Hero'
import { FeaturedJobs } from '../../components/Home/FeaturedJobs'
import { RecommendedJobsSection } from '../../components/Home/RecommendedJobsSection'

export const Home = () => {

  return (
    <div>
      <Hero />
      <RecommendedJobsSection />
      <FeaturedJobs />
    </div>
  )
}