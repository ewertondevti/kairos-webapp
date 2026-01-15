import styles from "./ImagesSkeleton.module.scss";

export const ImagesSkeleton = () => {
  const heights = [260, 320, 300, 360, 280, 340, 310, 370, 290, 330, 350, 270];

  return (
    <div className={styles.wrapper}>
      <div className={styles.masonry}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.card}>
              <div
                className={styles.photo}
                style={{ height: heights[index % heights.length] }}
              />
              <div className={styles.label}>
                <div className={styles.line} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
