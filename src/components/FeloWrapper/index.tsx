import styled, { css } from 'styled-components/macro'

const FELOWrapper = styled.div<{ expert: boolean }>`
  ${(props) =>
    props.expert
      ? css`
          display: grid;
          grid-template-rows: 1fr fit-content();
          grid-template-columns: minmax(min(100%, 475px), 1fr) minmax(min(100%, 475px), 475px);
          row-gap: 2rem;
          column-gap: 2rem;

          border: none;
          padding: 1rem 1rem 7rem;
          width: 100%;
          height: 100%;
          min-height: 90vh;
          z-index: 0;

          & > :nth-child(n + 2) {
            height: fit-content;
          }

          ${({ theme }) => theme.mediaWidth.upToMedium`
          grid-template-columns: minmax(min(100%, 475px), 1fr);
          padding: 1rem 1rem 8rem;
        `};
        `
      : css`
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          border: none;
          padding: 1rem 1rem 7rem;
          width: calc(100% - 1rem);
          height: 100%;
          min-height: 90vh;
          z-index: 0;

          ${({ theme }) => theme.mediaWidth.upToMedium`
                  padding: 1rem 1rem 8rem;
              `};
          main:nth-child(1) {
            order: 2;
          }
          :nth-child(4) {
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;

            > div:nth-child(2) {
              flex: 1;
              min-width: 280px;
              max-width: 475px;
              order: 3;
              ${({ theme }) => theme.mediaWidth.upToMedium`
                      min-width: 100%;
                      max-width: 100%;
                      order: 2;
                    `};
            }

            > div:nth-child(1) {
              flex: 2;
              order: 2;
            }

            > div:nth-child(3) {
              flex: 1;
              min-width: 280px;
              max-width: 475px;
              ${({ theme }) => theme.mediaWidth.upToMedium`
                      min-width: 100%;
                      max-width: 100%;
                      order: 2;
                    `};
            }
          }
        `}
`

export default FELOWrapper
