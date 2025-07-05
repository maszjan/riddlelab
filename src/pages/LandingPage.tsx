import React from "react";
import HeroSection from "../components/organisms/Landing/HeroSection";
import CommunityRoomsSection from "../components/organisms/Landing/CommunityRoomsSection";
import EditorShowcaseSection from "../components/organisms/Landing/EditorShowcaseSection";
import HowToPlaySection from "../components/organisms/Landing/HowToPlaySection";
import CTASection from "../components/organisms/Landing/CTASection";

const LandingPage: React.FC = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			<HeroSection />
			<CommunityRoomsSection />
			<EditorShowcaseSection />
			<HowToPlaySection />
			<CTASection />
		</div>
	);
};

export default LandingPage;
