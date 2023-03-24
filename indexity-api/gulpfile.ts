import { createProject } from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';
import { dest, src, series } from 'gulp';
import { join } from 'path';

const tsProject = createProject('tsconfig.build.json');

// eslint-disable @typescript-eslint/explicit-function-return-type

const buildTs = (): NodeJS.ReadWriteStream =>
  tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(
      sourcemaps.write('.', {
        sourceRoot: tsProject.options.rootDir,
        includeContent: true,
      }),
    )
    .pipe(dest(tsProject.options.outDir));

const copyHbs = (): NodeJS.ReadWriteStream =>
  src(join(tsProject.options.rootDir, '**/*.hbs')).pipe(
    dest(tsProject.options.outDir),
  );

exports.build = series(buildTs, copyHbs);
