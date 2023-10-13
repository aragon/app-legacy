import {useEffect, useState} from 'react';

export interface IUseScreenResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const reportScreenWidth: () => IUseScreenResult = () => {
  const {innerWidth} = window;

  if (innerWidth < 768) {
    return {isMobile: true, isTablet: false, isDesktop: false};
  }
  if (innerWidth < 1280) {
    return {isMobile: false, isTablet: true, isDesktop: false};
  }

  return {isMobile: false, isTablet: false, isDesktop: true};
};

export const useScreen = (): IUseScreenResult => {
  const [widthConditions, setWidthConditions] = useState(reportScreenWidth());

  useEffect(() => {
    const handleChange = () => setWidthConditions(reportScreenWidth());

    window.addEventListener('resize', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return widthConditions;
};
