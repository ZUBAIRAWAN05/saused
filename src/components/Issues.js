import React, {useState, useEffect} from "react";
import {FlexCenter, IssuesColumn} from "../styles/Grid";
import api from "../lib/apiGraphQL";
import Card from "./Card";
import {TinyFont} from "../styles/Typography";
import List from "../styles/List";
import {InputButton} from "../styles/Button";
import {CardPadding} from "../styles/Card";

function Issues({repoName, owner}) {
  const [issues, setIssues] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    api.fetchIssuesQuery(owner, repoName).then(response => {
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const lastIssue = totalCount > 0 ? data[data.length - 1] : {};
      const {cursor} = lastIssue;

      setIssues(data);
      setCursor(cursor);
      setTotal(totalCount);
    });
  }, []);

  const _handleNextIssues = () => {
    api.fetchRepositoryIssues(owner, repoName, cursor).then(response => {
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const firstIssue = data[data.length - 1];
      const newCursor = firstIssue.cursor;
      setIssues(data);
      setCursor(newCursor);
      setTotal(totalCount);
      setOffset(offset + 5);
    });
  };

  const _handlePreviousIssues = () => {
    api.fetchRepositoryIssues(owner, repoName, cursor, true).then(response => {
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const newCursor = data[0].newCursor;
      setIssues(data);
      setCursor(newCursor);
      setTotal(totalCount);
      setOffset(offset - 5);
    });
  };

  const totalPages = Math.round(totalCount / 5);
  const currentPage = offset / 5 + 1;

  return owner ? (
    totalCount > 0 && (
      <IssuesColumn>
        <Card fitted>
          <CardPadding>
            <h1>Issues</h1>
            <hr />
          </CardPadding>
          <List>
            {issues &&
              issues.map(issue => (
                <li key={issue.node.id}>
                  <a target="_blank" href={issue.node.url}>
                    <TinyFont>
                      {issue.node.title}
                      <div style={{display: "flex"}}>
                        {issue.labels && issue.labels.data.map(label => console.log(label.name))}
                      </div>
                    </TinyFont>
                  </a>
                </li>
              ))}
            <CardPadding>
              <FlexCenter>
                {offset > 0 && <InputButton onClick={_handlePreviousIssues}>Prev</InputButton>}
                {currentPage !== totalPages && <InputButton onClick={_handleNextIssues}>Next</InputButton>}
              </FlexCenter>
            </CardPadding>
          </List>
        </Card>
      </IssuesColumn>
    )
  ) : (
    <p>...Loading</p>
  );
}

export default Issues;
