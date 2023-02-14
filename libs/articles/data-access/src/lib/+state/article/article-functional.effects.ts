import { inject } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, tap } from 'rxjs';
import { articlesActions } from '../articles.actions';
import { ActionsService } from '../../services/actions.service';
import { articleActions } from './article.actions';
import { ArticlesService } from '../../services/articles.service';
import { formsActions, ngrxFormsQuery } from '@realworld/core/forms/src';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

export const favorite$ = createEffect(
  (actions$ = inject(Actions), actionsService = inject(ActionsService)) => {
    return actions$.pipe(
      ofType(articlesActions.favorite),
      concatMap(({ slug }) =>
        actionsService.favorite(slug).pipe(
          map((response) => articlesActions.favoriteSuccess({ article: response.article })),
          catchError((error) => of(articlesActions.favoriteFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const unFavorite$ = createEffect(
  (actions$ = inject(Actions), actionsService = inject(ActionsService)) => {
    return actions$.pipe(
      ofType(articlesActions.unfavorite),
      concatMap(({ slug }) =>
        actionsService.unfavorite(slug).pipe(
          map((response) => articlesActions.unfavoriteSuccess({ article: response.article })),
          catchError((error) => of(articlesActions.unfavoriteFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const unFollow$ = createEffect(
  (actions$ = inject(Actions), actionsService = inject(ActionsService)) => {
    return actions$.pipe(
      ofType(articleActions.unfollow),
      concatMap(({ username }) =>
        actionsService.unfollowUser(username).pipe(
          map((response) => articleActions.unfollowSuccess({ profile: response.profile })),
          catchError((error) => of(articleActions.unfollowFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const follow$ = createEffect(
  (actions$ = inject(Actions), actionsService = inject(ActionsService)) => {
    return actions$.pipe(
      ofType(articleActions.follow),
      concatMap(({ username }) =>
        actionsService.followUser(username).pipe(
          map((response) => articleActions.followSuccess({ profile: response.profile })),
          catchError((error) => of(articleActions.followFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const deleteComment$ = createEffect(
  (actions$ = inject(Actions), articlesService = inject(ArticlesService)) => {
    return actions$.pipe(
      ofType(articleActions.deleteComment),
      concatMap(({ commentId, slug }) =>
        articlesService.deleteComment(commentId, slug).pipe(
          map((_) => articleActions.deleteCommentSuccess({ commentId })),
          catchError((error) => of(articleActions.deleteCommentFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const addComment$ = createEffect(
  (actions$ = inject(Actions), articlesService = inject(ArticlesService), store = inject(Store)) => {
    return actions$.pipe(
      ofType(articleActions.addComment),
      concatLatestFrom(() => store.select(ngrxFormsQuery.selectData)),
      exhaustMap(([{ slug }, data]) =>
        articlesService.addComment(slug, data.comment).pipe(
          map((response) => articleActions.addCommentSuccess({ comment: response.comment })),
          catchError(({ error }) => of(formsActions.setErrors({ errors: error.errors }))),
        ),
      ),
    );
  },
  { functional: true },
);

export const addCommentSuccess$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(articleActions.addCommentSuccess),
      map(() => formsActions.resetForm()),
    );
  },
  { functional: true },
);

export const deleteArticle$ = createEffect(
  (actions$ = inject(Actions), articlesService = inject(ArticlesService), store = inject(Store)) => {
    return actions$.pipe(
      ofType(articleActions.deleteArticle),
      concatLatestFrom(() => store.select(ngrxFormsQuery.selectData)),
      concatMap((action) =>
        articlesService.deleteArticle(action.slug).pipe(
          map(() => articleActions.deleteArticleSuccess()),
          catchError((error) => of(articleActions.deleteArticleFailure(error))),
        ),
      ),
    );
  },
  { functional: true },
);

export const deleteArticleSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(articleActions.deleteArticleSuccess),
      tap(() => router.navigate(['/'])),
    );
  },
  { functional: true, dispatch: false },
);