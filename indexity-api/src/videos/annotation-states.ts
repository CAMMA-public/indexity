export enum AnnotationStates {
  ANNOTATION_PENDING = 'ANNOTATION_PENDING',
  ANNOTATING = 'ANNOTATING',
  ANNOTATION_FINISHED = 'ANNOTATION_FINISHED',
  ANNOTATION_NOT_REQUIRED = 'ANNOTATION_NOT_REQUIRED',
}

// any user can make these transitions
export const publicTransitionsFrom = {
  [AnnotationStates.ANNOTATION_NOT_REQUIRED]: [],
  [AnnotationStates.ANNOTATION_PENDING]: [AnnotationStates.ANNOTATING],
  [AnnotationStates.ANNOTATING]: [AnnotationStates.ANNOTATION_FINISHED],
  [AnnotationStates.ANNOTATION_FINISHED]: [AnnotationStates.ANNOTATING],
};
