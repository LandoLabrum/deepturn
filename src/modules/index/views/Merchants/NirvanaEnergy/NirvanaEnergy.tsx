// Relative Path: ./MbOne.tsx
import React, { useEffect, useState } from 'react';
import styles from "./NirvanaEnergy.scss";
import AdaptGrid from '@webstack/components/AdaptGrid/AdaptGrid';
import HomeGridItem from '../../HomeGridItem/HomeGridItem';
import ProductQuote from '~/src/modules/ecommerce/Products/views/ProductDescription/ProductQuote/Version1/controller/ProductQuote';
import AdapTable from '@webstack/components/AdapTable/views/AdapTable';
import { UiIcon } from '@webstack/components/UiIcon/UiIcon';
import { upperCase } from 'lodash';
import UiMedia from '@webstack/components/UiMedia/controller/UiMedia';
import useScroll from '@webstack/hooks/useScroll';
import GLBViewer from '@webstack/components/ThreeComponents/ThreeGLB/ThreeGLB';
import useWindow from '@webstack/hooks/window/useWindow';
import { visibility } from 'html2canvas/dist/types/css/property-descriptors/visibility';

const NirvanaEnergyIcon = () => {
  const nStyle = `.nirv{
      display: flex;
      color: var(--blue-10);
      --ui-icon-color: var(--blue-10);
      gap: var(--s-9);
      font-size: var(--s-5);
  }`;
  return <>
    <style jsx>{nStyle}</style><style jsx>{styles}</style>
    <div className='nirv'>
      <div className='nirv--icon'>
        <UiIcon icon={`nirvana-energy-logo`} />
      </div>
      Nirvana Energy
    </div>
  </>
}
// Remember to create a sibling SCSS file with the same name as this component
const NirvanaEnergy = () => {
  const { width } = useWindow();

  const [currentScrollYPosition] = useScroll();
  const [view, setView] = useState('start');
  const outputValue = (powerInKW: number) => {
    const volts = 240;
    const powerFactor = 1;
    const ampStr = String((powerInKW * 1000) / (volts * powerFactor)).split('.');
    const addAmp = Number(String(ampStr[1])[0]) > 5;
    const amps = addAmp ? Number(ampStr[0]) + 2 : ampStr[0];
    return `${powerInKW} kW = ${amps} Amps`;
  };
  const CompetitorBrand
    = ({ competitor }: { competitor: string }) => {
      return <>
        <style jsx>{styles}</style>
        <div className='nirvana-energy__competitor'>
          {upperCase(competitor)}
        </div>
      </>
    }
  const tableData = [
    {
      manufacturer: <CompetitorBrand
        competitor="tesla" />, 'capacity': "13 kW", 'output': outputValue(5.5)
    },
    {
      manufacturer: <CompetitorBrand
        competitor='LG' />, 'capacity': "15 kW", 'output': outputValue(6.4)
    },

    {
      manufacturer:
        <CompetitorBrand
          competitor='Enphase' />, 'capacity': "12 kW", 'output': outputValue(5)
    },
    {
      manufacturer: <CompetitorBrand
        competitor='Generack' />, 'capacity': "15.5 kW", 'output': outputValue(4.5)
    },
    {
      manufacturer: <CompetitorBrand
        competitor='GrowWatt' />, 'capacity': "10 kW", 'output': outputValue(6)
    },
    {
      manufacturer:
        <NirvanaEnergyIcon />, 'capacity': "15 kW", 'output': outputValue(12)
    },
  ];
  const bgOpacity = (): any => {
    const scrollFadeMatrix = -currentScrollYPosition * .002 + 1
    if (scrollFadeMatrix < 0) return { opacity: 0, visibility: 'hidden' };
    return currentScrollYPosition > 10 ? {
      opacity: scrollFadeMatrix,
      visibility: 'visible'
    } : {}
  }

  useEffect(() => { }, [setView]);
  return (
    < >
      <style jsx>{styles}</style>
      <div
        id='nirvana-index'
        className='nirvana-energy'
      >

        <div className='nirvana-energy__bg'
          style={
            bgOpacity()}>
          <div className='nirvana-energy__bg--video'>
            {width > 1100 && <UiMedia playbackSpeed={.7} // Plays video at 1.5x speed
            type='video' autoplay muted loop src="https://github.com/landolabrum/assets/raw/refs/heads/main/nirv1/b-roll/home.webm" />}</div>
          <div className='nirvana-energy__bg--content'>
            <ProductQuote
              id='product-quote'
              startButton={<>
                <div className='configure-btn__text'>
                  configure your back up system.
                </div>
                <div className='configure-btn__model'>
                  <GLBViewer
                    width={width > 1100 ? "400px" : "90vw"}
                    height={width > 1100 ? "500px" : "90vw"}
                    modelPath='/merchant/nirv1/3dModels/products/CustomBox/prod_P5lI35r2EWTAxi.glb'
                  />
                </div>
              </>
              } view={view} setView={setView} />

          </div>
        </div>
        {/* <video controls autoPlay muted>
  <source src="https://github.com/landolabrum/assets/raw/refs/heads/main/nirv1/b-roll/1CB9037F-80AE-4FFA-8D34-2CDDA39AF929.webm" type="video/webm"/>
  Your browser does not support the video tag.
</video> */}
        <div className='nirvana-energy__content--first'>
          <div className='nirvana-energy__content--title'>
            It&apos;s Time to Create your Nirvana!
          </div>
          <div className='nirvana-energy__content--label'>
            On and Off-grid battery back up
            If you&apos;re thinking about going off grid or want to learn more about backup battery systems, it&apos;s time to create your Nirvana.
          </div>
        </div>
        <div className='nirvana-energy__content'>


          {view == 'start' && <>
            <div className='list'>
              <div className='nirvana-energy__content--sub-title'>6 Key Questions to Enhance Your Solar System with Batteries</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />Can I add batteries to my exisiting solar system?</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />What determines that the battery will back up what I need?</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />Will this battery keep me backed up if the grid stays down?</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />What does this battery setup have that others dont?</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />Is there a limit to how much the batteries can power in my home at the same time?</div>
              <div className='nirvana-energy__content--label'><UiIcon icon="fa-cube" />Can I change what I want backed up in the future</div>
            </div>

            <div className='nirvana-energy__content--title'>
              The Importance of Backup Batteries
            </div>
            <AdaptGrid sm={1} md={3} margin='0 0 45px' gap={15}>
              <HomeGridItem icon='fal-cloud-bolt-sun' title='power outages' >
                With backup batteries, you can be sure your home will have
                power even during outages.
                Most batteries will only back up what is stored when the grid goes down. Be sure to get our system that refills the battery if the grid stays down.
              </HomeGridItem>
              <HomeGridItem icon='fa-globe' title='environmental concerns' >
                Using solar battery backup systems helps reduce your carbon footprint. The less you rely on the grid, the more you do for our planet.
              </HomeGridItem>
              <HomeGridItem icon='fal-circle-dollar' title='cost savings' >
                Solar battery backup systems can help you save money on electricity bills in the long run.
                The 30% Federal Tax credit applies to battery storage that is connected to a PV
              </HomeGridItem>
            </AdaptGrid>
            {/* </div> */}
            <h3>On-grid vs Off-grid Solar Battery Backup Systems</h3>
            <AdaptGrid sm={1} md={2} margin='0 0' gapX={10}>
              <HomeGridItem title='on-grid'>
                On-grid systems are connected to the utility grid and can sell excess energy back to the power competitor or store excess energy depending on how the system is
              </HomeGridItem>
              <HomeGridItem title='environmental concerns' >
                Off-grid systems are not connected to the utility grid. These systems can be tailored to fit your needs no matter how big or small and using several different power sources.
              </HomeGridItem>
            </AdaptGrid>
            <br />
            <br />
            <br />
            <AdapTable
              options={{ hide: 'footer', tableTitle: "Discover Better Performance, Compared to Leading Brands." }}
              data={tableData}
            /></>
          }
        </div>
      </div>
    </>
  );
};

export default NirvanaEnergy;