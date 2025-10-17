import React from 'react';
import { useData } from '../context/DataContext';

const Sponsors: React.FC = () => {
  const { selectedTournament } = useData();
  const sponsors = selectedTournament?.sponsors || [];

  if (sponsors.length === 0) {
    return null;
  }

  // To ensure the loop is seamless, we duplicate the list until it's long enough
  // to likely fill the viewport, preventing gaps on wider screens.
  let displaySponsors = [...sponsors];
  while (displaySponsors.length > 0 && displaySponsors.length < 20) {
    displaySponsors = [...displaySponsors, ...sponsors];
  }
  
  // This final duplicated list is used for the animation.
  const animatedSponsors = [...displaySponsors, ...displaySponsors];

  // Adjust duration based on the number of original sponsors to keep speed consistent.
  const duration = displaySponsors.length * 2;
  const animationDuration = `${Math.max(40, duration)}s`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4 z-20">
      <div className="w-full flex overflow-hidden">
        <div 
          className="flex flex-nowrap animate-marquee"
          style={{'--marquee-duration': animationDuration} as React.CSSProperties}
        >
          {animatedSponsors.map((sponsor, index) => (
            <div key={`${sponsor.id}-${index}`} className="flex-shrink-0 mx-10 flex items-center justify-center">
              <img src={sponsor.logo} alt={sponsor.name} className="h-10 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sponsors;
