import {useEffect, useState} from 'react';
type useScreenType = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

// TODO: this is temporary; the sizes should come from
// TW. Using this because we have to mess with different tsconfigs
// to be able to pull in the tailwind config file
const reportScreenWidth: () => useScreenType = () => {
  const w = window.innerWidth;
  if (w < 768) {
    return {isMobile: true, isTablet: false, isDesktop: false};
  }
  if (w < 1280) {
    return {isMobile: false, isTablet: true, isDesktop: false};
  }
  return {isMobile: false, isTablet: false, isDesktop: true};
};

const useScreen = () => {
  const [widthConditions, setWidthConditions] = useState(reportScreenWidth());

  useEffect(() => {
    const handleChange = () => {
      setWidthConditions(reportScreenWidth());
    };

    window.addEventListener('resize', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return widthConditions;
};

export default useScreen;
